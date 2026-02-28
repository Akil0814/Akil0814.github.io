class Effect :public Animation
{
public:
	Effect();
	~Effect() override = default;

	void on_render(SDL_Renderer* renderer);
	void on_update(double delta)override;

	std::unique_ptr<Effect> clone()const;

	void set_play_data(SDL_Point pos,double angle);
	void set_play_data(SDL_Rect rect, double angle);
	void set_sound_effect(Mix_Chunk* sound);

	bool is_finished();

private:

	double angle = 0;
	bool is_valid = false;
	bool have_rect = false;
	bool have_sound = false;

	Mix_Chunk* sound_effect = nullptr;
	SDL_Point play_pos = { 0 };
	SDL_Rect play_rect = { 0 };
};