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

std::unique_ptr<Effect> Effect::clone()const
{
	auto clone_effect = std::make_unique<Effect>();

	clone_effect->set_frame(texture_list);
	clone_effect->set_interval(interval);
	clone_effect->set_loop(is_loop);
	clone_effect->set_on_finished(on_finished);

	if (have_sound)
		clone_effect->set_sound_effect(sound_effect);

	return clone_effect;
}

void Effect::on_update(double delta)
{
	if(idx_frame==0 && have_sound)
		Mix_PlayChannel(-1, sound_effect, 0);

	Animation::on_update(delta);
}

...