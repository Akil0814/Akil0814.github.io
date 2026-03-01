class Ship
{
public:
	Ship()=default;
	~Ship() = default;

	void init_pos(SDL_Point& first_pos);
	void set_position(const SDL_Point& pos);

	void set_board_in(Board* board);

	void on_update(double delta);
	void on_render(SDL_Renderer* renderer);
	void on_input(const SDL_Event& event);

	SkillType get_skill_type()const;
	int get_skill_time()const;
	void use_skill();

	void take_damage();
	bool can_defense();
	void reinforce();

	bool is_in_board()const;
	bool is_sink() const;
	int get_atk_time() const;
	bool check_motion()const;
	void update_in_board_pos(SDL_Point pos);
	bool can_detect()const;

protected:
	void init_ship(SDL_Texture* texture,
		int size, int hp, int datk_time, int defense_time,
		SkillType skill = SkillType::NONE, int time = 0);

	void set_can_detect(bool d);

	bool check_cursor_hit(int x, int y)const;
	void update_rect();
	void rotate_ship();


private:
    other member variables...
};


void Ship::on_input(const SDL_Event& event)
{
	if (event.type == SDL_MOUSEBUTTONDOWN && check_cursor_hit(event.button.x, event.button.y))
	{

		if (event.button.button == SDL_BUTTON_LEFT && !ship_in_rotate)
		{
			ship_in_move = true;
			delta.x = event.button.x - collision_rect.x;
			delta.y = event.button.y - collision_rect.y;
			player_board->move_ship({ absolute_position.x,absolute_position.y }, ship_size, horizontal);
		}

		if (event.button.button == SDL_BUTTON_RIGHT && !ship_in_move && ship_in_board)
		{
			ship_in_rotate = true;
			player_board->move_ship({ absolute_position.x,absolute_position.y }, ship_size, horizontal);
		}
	}

	if (ship_in_move && event.type == SDL_MOUSEMOTION)
		set_position({ event.motion.x - delta.x, event.motion.y - delta.y });

	if (event.type == SDL_MOUSEBUTTONUP && event.button.button == SDL_BUTTON_LEFT && ship_in_move)
	{
		ship_in_move = false;
		delta = { 0 };

			SDL_Point new_pos = player_board->place_ship(this, absolute_position, ship_size, horizontal);
			if (new_pos.x>=0)
			{
				set_position(new_pos);
				ship_in_board=true;
				last_position = new_pos;
				Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Put_In_Water), 0);
			}
			else
			{
				player_board->place_ship(this, last_position, ship_size, horizontal);
				set_position(last_position);
				Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Error), 0);
				if (ship_in_board != false)
					player_board->place_ship(this, last_position, ship_size, horizontal);
			}
	}

	if (event.type == SDL_MOUSEBUTTONUP && event.button.button == SDL_BUTTON_RIGHT && ship_in_rotate && !ship_in_move)
	{
		ship_in_rotate = false;
		SDL_Point new_pos = player_board->place_ship(this,absolute_position, ship_size, !horizontal);
		if (new_pos.x >= 0)
		{
			rotate_ship();
			Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Put_In_Water), 0);
		}
		else
		{
			player_board->place_ship(this, last_position, ship_size, horizontal);
			Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Error), 0);
		}

	}

	if (event.window.event == SDL_WINDOWEVENT_LEAVE && ship_in_move)
	{
		ship_in_move = false;
		delta = { 0 };
		set_position(last_position);
		Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Error), 0);
	}

}
