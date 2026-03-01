class Atlas
{
public:
	Atlas()=default;
	~Atlas()=default;

	void clear();
	int get_size() const;
	bool add_Texture(SDL_Texture* new_texture);
	bool add_Textures(std::initializer_list<SDL_Texture*> textures);
	SDL_Texture* get_texture(size_t num)const;

#if __cplusplus >= 201703L
	template<typename... Textures>
	bool add_Textures(Textures*... textures)
	{
		if constexpr (sizeof...(textures) == 0)
			return false;

		if (!(... && (textures != nullptr)))
			return false;

		(texture_list.push_back(textures), ...);
		return true;
	}
#endif

private:
	std::vector<SDL_Texture*>texture_list;
};