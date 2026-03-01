bool DataManager::reset_database(bool remove_backup)
{
    m_last_error.clear();
    
    m_init_ed = false;

    if (QSqlDatabase::contains(m_conn_name))
    {
        {
            QSqlDatabase db = QSqlDatabase::database(m_conn_name, false);
            if (db.isValid() && db.isOpen())
                db.close();
        }
        QSqlDatabase::removeDatabase(m_conn_name);
        
    }

    QString time=QDateTime::currentDateTime().toString("yyyyMMdd_HHmmss_zzz");
    
    if (QFile::exists(m_db_path))
    {
        QString backup = m_db_path + time +".bak";
        if (!QFile::rename(m_db_path, backup))
        {
            m_last_error = "failed to backup db file";
            m_init_ed = false;
            if(init())
                m_last_error += ", but database is still usable";
            else
                m_last_error += ", and database is not usable";
            
            return false;
        }
    }


    if (!init())
    {
        QFile::remove(m_db_path);
        QFile::rename(m_db_path + time + ".bak", m_db_path);

        m_init_ed=false;
        m_last_error = "failed to initialize new database";
        if(init())
            m_last_error += ", but restored backup successfully";
        else
            m_last_error += ", and failed to restore backup";

        return false;
    }

    if(remove_backup)
        QFile::remove(m_db_path + time + ".bak");

    return true;
}
