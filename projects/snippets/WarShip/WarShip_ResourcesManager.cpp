enum class ResID
{
	Font_48,
    ...
	Sound_Next_Player,
	Sound_Button_Metal,
    ...
	Music_Game_End,
    ...
	Tex_Num_0,
	Tex_Coin,
    ...
};

typedef std::unordered_map<ResID, TTF_Font*> FontPool;
typedef std::unordered_map<ResID, Mix_Chunk*> SoundPool;
typedef std::unordered_map<ResID, Mix_Music*> MusicPool;
typedef std::unordered_map<ResID, SDL_Texture*> TexturePool;

class ResourcesManager : public Manager<ResourcesManager>
{
	friend class Manager<ResourcesManager>;
public:
	bool load_from_file(SDL_Renderer* renderer);

	TTF_Font* get_font(ResID id) const;
	Mix_Chunk* get_sound(ResID id) const;
	Mix_Music* get_music(ResID id) const;
	SDL_Texture* get_texture(ResID id)const;

protected:
	ResourcesManager() {};
	~ResourcesManager() {};

private:
	FontPool font_pool;
	SoundPool sound_pool;
	MusicPool music_pool;
	TexturePool texture_pool;
};
