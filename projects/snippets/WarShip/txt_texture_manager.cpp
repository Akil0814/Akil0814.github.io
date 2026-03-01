class TxtTextureManager :public Manager<TxtTextureManager>
{
	friend class  Manager<TxtTextureManager>;
	typedef std::unordered_map<std::string, SDL_Texture*> TextTexturePool;

protected:
	TxtTextureManager() = default;
	~TxtTextureManager();

public:

	SDL_Texture* get_txt_texture(SDL_Renderer* renderer,TTF_Font* font,const std::string& text, 
								bool is_bold = false, const SDL_Color& color = { 0,0,0,255 });

private:

	TxtTextureManager(const TxtTextureManager&) = delete;
	TxtTextureManager& operator=(const TxtTextureManager&) = delete;

	std::string make_text_key(const std::string& text, int style,const SDL_Color& color)const;

	bool is_nullptr(SDL_Renderer* renderer, TTF_Font* font, const std::string& text)const;

private:
	TextTexturePool text_texture_pool;
};