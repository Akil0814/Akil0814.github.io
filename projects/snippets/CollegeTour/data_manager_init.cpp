bool DataManager::init()
{
    if (m_init_ed)
        return true;

    if (!open_db())
        return false;

    if (!init_pragmas())
        return false;

    if (!init_schema())
        return false;

    if (!seed_if_empty())
        return false;

    m_init_ed = true;

    return true;
}

bool DataManager::open_db()
{
    m_last_error.clear();

    QDir dir(QDir::current());

    QString data_dir_path;
    for (int i = 0; i < 8; ++i)
    {
        const QString candidate = dir.filePath("data");
        if (QDir(candidate).exists())
        {
            data_dir_path = QDir(candidate).absolutePath();
            break;
        }

        const QString candidate2 = dir.filePath("College_Tour/data");
        if (QDir(candidate2).exists())
        {
            data_dir_path = QDir(candidate2).absolutePath();
            break;
        }

        if (!dir.cdUp())
            break;
    }

    if (data_dir_path.isEmpty())
    {
        const QString fallback = QDir::current().filePath("data");
        QDir().mkpath(fallback);
        data_dir_path = QDir(fallback).absolutePath();
    }

    m_db_path = QDir(data_dir_path).filePath("college_tour.db");

    QSqlDatabase db = QSqlDatabase::contains(m_conn_name)
        ? QSqlDatabase::database(m_conn_name)
        : QSqlDatabase::addDatabase("QSQLITE", m_conn_name);

    db.setDatabaseName(m_db_path);

    if (!db.open())
    {
        m_last_error = db.lastError().text();
        return false;
    }

    return true;
}

bool DataManager::init_pragmas()
{
    m_last_error.clear();

    QSqlDatabase db = QSqlDatabase::database(m_conn_name);
    if (!db.isValid() || !db.isOpen())
    {
        m_last_error = "Database is not open.";
        return false;
    }

    QSqlQuery q(db);

    auto exec_sql = [&](const QString& sql) -> bool
        {
            if (!q.exec(sql))
            {
                m_last_error = q.lastError().text() + " | SQL: " + sql;
                return false;
            }
            return true;
        };

    if (!exec_sql("PRAGMA foreign_keys = ON;"))
        return false;

    if (!q.exec("PRAGMA journal_mode = WAL;"))
    {
        if (!q.exec("PRAGMA journal_mode = DELETE;"))
        {
            m_last_error = q.lastError().text() + " | SQL: PRAGMA journal_mode";
            return false;
        }
    }

    if (!exec_sql("PRAGMA synchronous = NORMAL;"))
        return false;

    if (!exec_sql("PRAGMA temp_store = MEMORY;"))
        return false;

    db.setConnectOptions("QSQLITE_BUSY_TIMEOUT=5000");

    return true;
}

bool DataManager::init_schema()
{
    m_last_error.clear();

    QSqlDatabase db = QSqlDatabase::database(m_conn_name);
    if (!db.isValid() || !db.isOpen())
    {
        m_last_error = "Database is not open.";
        return false;
    }

    QSqlQuery q(db);

    auto exec_sql = [&](const QString& sql) -> bool
        {
            if (!q.exec(sql))
            {
                m_last_error = q.lastError().text() + " | SQL: " + sql;
                return false;
            }
            return true;
        };

    if (!exec_sql(
        "create table if not exists college ("
        "    college_id integer primary key autoincrement,"
        "    name text not null unique"
        ");"))
        return false;

    if (!exec_sql(
        "create table if not exists souvenir ("
        "    souvenir_id integer primary key autoincrement,"
        "    college_id integer not null,"
        "    name text not null,"
        "    price real not null check(price >= 0),"
        "    foreign key(college_id) references college(college_id)"
        "        on delete cascade"
        "        on update cascade,"
        "    unique(college_id, name)"
        ");"))
        return false;

    if (!exec_sql("create index if not exists idx_souvenir_college_id on souvenir(college_id);"))
        return false;

    const QString create_distance_sql =
        "create table if not exists distance ("
        "    a_college_id integer not null,"
        "    b_college_id integer not null,"
        "    miles real not null check(miles >= 0),"
        "    primary key(a_college_id, b_college_id),"
        "    foreign key(a_college_id) references college(college_id)"
        "        on delete cascade"
        "        on update cascade,"
        "    foreign key(b_college_id) references college(college_id)"
        "        on delete cascade"
        "        on update cascade,"
        "    check(a_college_id < b_college_id)"
        ");";

    bool has_distance_table = false;
    QSet<QString> distance_cols;
    if (!q.exec("PRAGMA table_info(distance);"))
    {
        m_last_error = q.lastError().text() + " | SQL: PRAGMA table_info(distance);";
        return false;
    }
    while (q.next())
    {
        has_distance_table = true;
        distance_cols.insert(q.value(1).toString());
    }

    const bool has_ab_schema =
        distance_cols.contains("a_college_id") &&
        distance_cols.contains("b_college_id");
    const bool has_from_to_schema =
        distance_cols.contains("from_college_id") &&
        distance_cols.contains("to_college_id");

    if (!has_distance_table)
    {
        if (!exec_sql(create_distance_sql))
            return false;
    }
    else if (!has_ab_schema && !has_from_to_schema)
    {
        m_last_error = "Unsupported distance table schema.";
        return false;
    }
    else
    {
        bool need_normalize = has_from_to_schema;

        if (has_ab_schema && !need_normalize)
        {
            // Existing table may contain non-canonical rows (a >= b) including reverse duplicates.
            if (!q.exec("select 1 from distance where a_college_id >= b_college_id limit 1;"))
            {
                m_last_error = q.lastError().text();
                return false;
            }

            if (q.next())
                need_normalize = true;
        }

        if (need_normalize)
        {
            if (!db.transaction())
            {
                m_last_error = db.lastError().text();
                return false;
            }

            auto rollback_schema = [&]() -> bool
                {
                    m_last_error = q.lastError().text();
                    db.rollback();
                    return false;
                };

            if (!q.exec("alter table distance rename to distance_old;"))
                return rollback_schema();

            if (!q.exec(create_distance_sql))
                return rollback_schema();

            const QString source_a = has_from_to_schema ? "from_college_id" : "a_college_id";
            const QString source_b = has_from_to_schema ? "to_college_id" : "b_college_id";

            const QString normalize_sql = QString(
                "insert into distance(a_college_id, b_college_id, miles) "
                "select canon_a, canon_b, min(miles) "
                "from ("
                "    select "
                "        case when %1 < %2 then %1 else %2 end as canon_a, "
                "        case when %1 < %2 then %2 else %1 end as canon_b, "
                "        miles "
                "    from distance_old"
                ") "
                "where canon_a <> canon_b "
                "group by canon_a, canon_b;").arg(source_a, source_b);

            if (!q.exec(normalize_sql))
                return rollback_schema();

            if (!q.exec("drop table distance_old;"))
                return rollback_schema();

            if (!db.commit())
            {
                m_last_error = db.lastError().text();
                db.rollback();
                return false;
            }
        }
    }

    if (!exec_sql("create index if not exists idx_distance_a on distance(a_college_id);"))
        return false;

    if (!exec_sql("create index if not exists idx_distance_b on distance(b_college_id);"))
        return false;


    if (!exec_sql(
        "create table if not exists trip ("
        "    trip_id integer primary key autoincrement,"
        "    start_college_id integer not null,"
        "    created_at text not null default (datetime('now')),"
        "    total_miles real not null default 0 check(total_miles >= 0),"
        "    foreign key(start_college_id) references college(college_id)"
        "        on delete restrict"
        "        on update cascade"
        ");"))
        return false;

    if (!exec_sql(
        "create table if not exists purchase ("
        "    trip_id integer not null,"
        "    college_id integer not null,"
        "    souvenir_id integer not null,"
        "    quantity integer not null check(quantity > 0),"
        "    unit_price real not null check(unit_price >= 0),"
        "    primary key(trip_id, souvenir_id),"
        "    foreign key(trip_id) references trip(trip_id)"
        "        on delete cascade"
        "        on update cascade,"
        "    foreign key(college_id) references college(college_id)"
        "        on delete cascade"
        "        on update cascade,"
        "    foreign key(souvenir_id) references souvenir(souvenir_id)"
        "        on delete cascade"
        "        on update cascade"
        ");"))
        return false;

    if (!exec_sql("create index if not exists idx_purchase_trip_id on purchase(trip_id);"))
        return false;

    if (!exec_sql("create index if not exists idx_purchase_college_id on purchase(college_id);"))
        return false;

    return true;
}

bool DataManager::seed_if_empty()
{
    m_last_error.clear();

    QSqlDatabase db = QSqlDatabase::database(m_conn_name);
    if (!db.isValid() || !db.isOpen())
    {
        m_last_error = "Database is not open.";
        return false;
    }

    auto table_has_rows = [&](const char* table_name, bool& has_rows) -> bool
        {
            QSqlQuery q(db);
            if (!q.exec(QString("select count(*) from %1;").arg(table_name)))
            {
                m_last_error = q.lastError().text();
                return false;
            }
            if (!q.next())
            {
                m_last_error = "count query returned no row";
                return false;
            }
            has_rows = q.value(0).toInt() > 0;
            return true;
        };

    bool has_college_rows = false;
    bool has_souvenir_rows = false;
    bool has_distance_rows = false;
    if (!table_has_rows("college", has_college_rows))
        return false;
    if (!table_has_rows("souvenir", has_souvenir_rows))
        return false;
    if (!table_has_rows("distance", has_distance_rows))
        return false;

    if (has_college_rows && has_souvenir_rows && has_distance_rows)
        return true;

    const QString data_dir = QFileInfo(m_db_path).dir().absolutePath();
    const QString souvenirs_csv = QDir(data_dir).filePath("college_souvenirs.csv");
    const QString distances_csv = QDir(data_dir).filePath("college_campus_distances.csv");

    if (!import_from_csv_files(souvenirs_csv, distances_csv))
        return false;

    return true;
}
