class DataManager :public Manager<DataManager>
{
    friend class Manager<DataManager>;

protected:
    DataManager()=default;
    ~DataManager() =default;

public:
    [[nodiscard]] bool init();
    [[nodiscard]] bool reset_database(bool remove_backup_if_success = false);
    [[nodiscard]] bool is_open() const;
    [[nodiscard]] QString last_error() const;

    QVector<college> get_all_colleges() const;
    std::optional<int> get_college_id(const QString& college_name) const;
    std::optional<QString> get_college_name(int college_id) const;
    QVector<distance_to> get_distances_from_college(int college_id) const;
    std::optional<double> get_distance_between_college(int college_id_1, int college_id_2) const;
    std::optional<double> get_distance_between_college(const QString& college_name_1, const QString& college_name_2) const;

    QVector<souvenir> get_all_souvenirs() const;
    QVector<souvenir> get_all_souvenirs_from_college(int college_id) const;
    QVector<souvenir> get_all_souvenirs_from_college(const QString& college_name) const;
    std::optional<int> get_souvenir_id(int college_id, const QString& souvenir_name) const;
    std::optional<souvenir> get_souvenir(int souvenir_id) const;

    bool delete_college(int college_id);
    std::optional<int> add_college(const QString& new_college_name);
    bool set_distance_between_college(int from_college_id, int to_college_id, double miles);

    std::optional<int> add_souvenir(const souvenir& s);
    std::optional<int> add_souvenir(int college_id, const QString& name, double price);
    bool adjust_souvenir_price(int college_id, const QString& souvenir_name,double price);
    bool adjust_souvenir_price(int souvenir_id, double price);
    bool delete_souvenir(int souvenir_id);

    bool add_campus_from_file(const QString& path, const QString& name);

private:
    bool open_db();
    bool init_pragmas();
    bool init_schema();
    bool seed_if_empty();
    bool import_from_csv_files(const QString& souvenirs_csv, const QString& distances_csv);
    bool import_distances_csv_file(const QString& distances_csv);

    QSqlDatabase get_db_or_set_error() const;
    bool prepare_and_exec(QSqlQuery& q, const QString& sql) const;
    bool prepare_or_set_error(QSqlQuery& q, const QString& sql) const;
    bool exec_or_set_error(QSqlQuery& q) const;

private:

    bool m_init_ed = false;
    QString m_conn_name = "main";
    QString m_db_path;
    mutable QString m_last_error;
};