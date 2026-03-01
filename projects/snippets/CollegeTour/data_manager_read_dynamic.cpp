bool DataManager::add_campus_from_file(const QString& path, const QString& name)
{
    if (!is_open())
    {
        m_last_error = "database is not open";
        return false;
    }

    m_last_error.clear();

    const QString file_name = name.trimmed();
    if (file_name.isEmpty())
    {
        m_last_error = "import file name is empty";
        return false;
    }

    QString distances_csv;
    QString path_err;

    auto resolve_distance_path = [](const QString& input_path, const QString& input_name ,QString& out_distances_csv, QString& err) -> bool
        {
            const QString clean_path = input_path.trimmed();
            if (clean_path.isEmpty())
            {
                err = "import path is empty";
                return false;
            }

            const QFileInfo input_info(clean_path);
            if (!input_info.exists())
            {
                err = "path does not exist: " + clean_path;
                return false;
            }

            if (input_info.isDir())
            {
                const QDir dir(input_info.absoluteFilePath());
                out_distances_csv = dir.filePath(input_name);
            }
            else
            {
                const QString file_name = input_info.fileName();
                if (file_name.compare(input_name, Qt::CaseInsensitive) == 0)
                {
                    out_distances_csv = input_info.absoluteFilePath();
                }
                else
                {
                    err = "path must be a folder or " + input_name;
                    return false;
                }
            }

            if (!QFileInfo::exists(out_distances_csv))
            {
                err = "Cannot open CSV: " + out_distances_csv;
                return false;
            }

            return true;
        };

    if (!resolve_distance_path(path, file_name, distances_csv, path_err))
    {
        m_last_error = path_err;
        return false;
    }

    return import_distances_csv_file(distances_csv);
}