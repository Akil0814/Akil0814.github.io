class Board
{
	typedef std::vector<std::vector<Tile>> TileBoard;

public:
	Board();
	~Board();

	void on_render(SDL_Renderer* renderer);
	void on_update(double delta, SkillType& current_skill);
	void on_input(const SDL_Event& event);

	void set_size(int row, int col);
	void set_board_pos(SDL_Point point);

	SDL_Point place_ship(Ship* ship,SDL_Point pos, int ship_size, bool is_horizontal);
	void show_place_feasibility(SDL_Renderer* renderer,SDL_Point pos, int ship_size, bool is_horizontal);
	void show_atk_feasibility(SDL_Renderer* renderer, SDL_Point pos);

	void ship_sink(SDL_Point pos, int ship_size, bool is_horizontal);

	void move_ship(SDL_Point pos, int ship_size, bool is_horizontal);

	bool is_inside(int x, int y) const;
	bool check_available(int x,int y, int ship_size, bool is_horizontal);
	bool is_on_animation();
	int get_atk_time_on_board()const;

	void draw_cover(SDL_Renderer* renderer);
	void reset_board();

	void if_can_take_action(bool can);
	bool have_action();
	int get_action_time();
	void reset_action_time();

	std::vector<std::vector<Tile>>& get_tile_board();

	static SDL_Texture* tile_hit;
	static SDL_Texture* tile_miss;
    ...

private:

	void draw_board(SDL_Renderer* renderer);
	void on_mouse_click(const SDL_Event& e);
	void on_mouse_move(const SDL_Event& e);
	void detect_board(SkillType type, SDL_Point index_center);

private:


	bool move_in_board = false;
	bool click_in_board = false;

	bool on_animation = false;

	bool start_action = false;
	bool can_take_action = false;
	int action_time = 0;

	int total_atk_time = 0;

	int board_render_x = 0;
	int board_render_y = 0;

	int index_x = 0;
	int index_y = 0;

	int row = 20;
	int col = 20;

	TileBoard board;
	SkillType skill_using = SkillType::NONE;

	SDL_Point mouse_pos = {0};
	SDL_Point mouse_click_tile_center = {0};

	SDL_Rect rect_select_target;
	SDL_Rect rect_water_splash;
	SDL_Rect rect_explosion_target;

};