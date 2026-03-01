bool id_verify(std::string i_user_name,std::string i_password)
{
    if (i_user_name.empty() || i_password.empty())
        return false;

    std::string key_path = try_get_key_path().toStdString() + "/key.dat";
    std::cout << key_path << std::endl;

    std::uint8_t key = 0;
    if (!get_key_from_file(key_path, key))
    {
        std::cerr << "get_key_from_file failed\n";
        return false;
    }

    std::ifstream in(key_path, std::ios::binary);
    if (!in)
    {
        std::cerr << "open key.dat failed\n";
        return false;
    }

    std::uint32_t file_magic = 0;
    if (!read_u32(in, file_magic)) return false;
    if (file_magic != magic)
    {
        std::cerr << "bad file magic\n";
        return false;
    }

    std::uint8_t file_version = 0;
    if (!read_u8(in, file_version)) return false;
    if (file_version != version)
    {
        std::cerr << "unsupported version\n";
        return false;
    }

    std::uint32_t u_len = 0, p_len = 0;

    if (!read_u32(in, u_len))
        return false;
    std::string u_enc_stored;
    if (!read_blob(in, u_enc_stored, u_len))
        return false;

    if (!read_u32(in, p_len))
        return false;
    std::string p_enc_stored;
    if (!read_blob(in, p_enc_stored, p_len))
        return false;

    const std::string u_enc_input = xor_copy(i_user_name, key);
    const std::string p_enc_input = xor_copy(i_password, key);

    return (u_enc_input == u_enc_stored) && (p_enc_input == p_enc_stored);
}