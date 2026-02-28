class Button
{
public:
	enum class Status
	{
		Idle = 0,
		Hovered,
		Pushed
	};

public:

	Button(SDL_Rect rect_button, SDL_Rect rect_message, SDL_Texture* texture_message,
			Mix_Chunk* sound_effect_down, Mix_Chunk* sound_effect_up);

	Button(SDL_Rect rect_button, SDL_Rect rect_message, SDL_Texture* texture_message,
			Mix_Chunk* sound_effect_down, Mix_Chunk* sound_effect_up,
			SDL_Color color_idle,SDL_Color color_hovered, SDL_Color color_pushed, SDL_Color color_frame);

	Button(SDL_Rect rect_button,Mix_Chunk* sound_effect_down, Mix_Chunk* sound_effect_up,
		SDL_Texture* texture_idle, SDL_Texture* texture_hovered, SDL_Texture* texture_pushed);

	Button(SDL_Rect rect_button, SDL_Rect rect_message, SDL_Texture* texture_message,
			Mix_Chunk* sound_effect_down, Mix_Chunk* sound_effect_up,
			SDL_Texture* texture_idle,SDL_Texture* texture_hovered, SDL_Texture* texture_pushed);

	~Button() = default;

	void on_render(SDL_Renderer* renderer);
	void on_input(const SDL_Event& event);
	void on_update(double delta);

	void set_on_click(std::function<void()> func);
	void set_on_hovered(std::function<void()> func);

	void set_status(Status status);

	void change_rect_button(SDL_Rect new_rect_button);
	void change_rect_message(SDL_Rect new_rect_message);
	void change_texture_message(SDL_Texture* new_texture_message);

	void set_on_holed();
	void reset_on_holed();

	int get_time_on_click()const;

	Status get_status()const;
	bool check_on_holed()const;

private:

	bool check_cursor_hit(int x, int y)const;

	template<typename T>
	void init_assert(T* ptr, const std::string& err_msg)const;

private:
	SDL_Rect rect_button = {0};
	SDL_Rect rect_message = {0};

	Mix_Chunk* sound_effect_down = nullptr;
	Mix_Chunk* sound_effect_up = nullptr;

	SDL_Texture* texture_message = nullptr;
	SDL_Texture* texture_idle = nullptr;
	SDL_Texture* texture_hovered = nullptr;
	SDL_Texture* texture_pushed = nullptr;

	SDL_Color color_frame = { 0,0,0,255 };

	
	SDL_Color color_idle = { 180, 180, 180, 255 };
	SDL_Color color_hovered = { 200, 200, 200, 255 };
	SDL_Color color_pushed = { 130, 130, 130, 255 };

	Status status = Status::Idle;

	std::function<void()> on_click = nullptr;
	std::function<void()> on_hovered = nullptr;

	bool have_sound_effect_down = false;
	bool have_sound_effect_up = false;

	bool have_texture = false;
	bool have_message = false;

	bool on_hold = false;

	int time_on_click = 0;

};