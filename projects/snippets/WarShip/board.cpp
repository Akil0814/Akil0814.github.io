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
	other member variables...
};

SDL_Point Board::place_ship(Ship* ship, SDL_Point pos, int ship_size, bool is_horizontal)
{
    int x, y = 0;

    if (pos.x - board_render_x < -(SIZE_TILE / 2) || pos.y - board_render_y < -(SIZE_TILE / 2))
    {
        x = std::floor(double(pos.x - board_render_x) / SIZE_TILE);
        y = std::floor(double(pos.y - board_render_y) / SIZE_TILE);
    }
    else
    {
        x = (pos.x - board_render_x) / SIZE_TILE;
        y = (pos.y - board_render_y) / SIZE_TILE;
    }

    if ((pos.x - board_render_x) % SIZE_TILE > SIZE_TILE / 2)
        x++;

    if ((pos.y - board_render_y) % SIZE_TILE > SIZE_TILE / 2)
        y++;

    if (check_available(x, y, ship_size, is_horizontal))
    {
        if (is_horizontal)
        {
            for (int i = 0; i < ship_size; ++i)
            {
                board[y][x + i].place_ship(ship);
            }
        }
        else
        {
            for (int i = 0; i < ship_size; ++i)
            {
                board[y + i][x].place_ship(ship);
            }
        }
        ship->update_in_board_pos({ x,y });
        return { (x * SIZE_TILE) + board_render_x,(y * SIZE_TILE) + board_render_y };
    }
    return { -1,-1 };
}


bool Board::check_available(int x,int y, int ship_size, bool is_horizontal)
{
    if (x < 0 || x >= col || y < 0 || y >= row)
        return false;

    if (board[y][x].has_ship())
        return false;

    if (is_horizontal) {
        if (x + ship_size > col)
            return false;
        for (int i = 1; i < ship_size; ++i)
        {
            if (board[y][x + i].has_ship())
                return false;
        }
    }
    else
    {
        if (y + ship_size > row)
            return false;
        for (int i = 1; i < ship_size; ++i)
        {
            if (board[y + i][x].has_ship())
                return false;
        }
    }
    return true;
}

void Board::show_place_feasibility(SDL_Renderer* renderer, SDL_Point pos, int ship_size, bool is_horizontal)  
{
    SDL_Point grid_pos = { 0 };


    if (pos.x - board_render_x < -(SIZE_TILE / 2) || pos.y - board_render_y < -(SIZE_TILE / 2))
    {
        int g_pos_x = std::floor( double(pos.x - board_render_x) / SIZE_TILE);
        int g_pos_y = std::floor(double(pos.y - board_render_y) / SIZE_TILE);

        grid_pos = {g_pos_x,g_pos_y};
    }
    else
    {
        grid_pos =
        {
            (pos.x - board_render_x) / SIZE_TILE,
            (pos.y - board_render_y) / SIZE_TILE
        };
    }

    if ((pos.x - board_render_x) % SIZE_TILE > SIZE_TILE / 2)
        grid_pos.x++;

    if ((pos.y - board_render_y) % SIZE_TILE > SIZE_TILE / 2)
        grid_pos.y++;


    SDL_Rect rect = {
                    board_render_x + grid_pos.x * SIZE_TILE,
                    board_render_y + grid_pos.y * SIZE_TILE,
                    is_horizontal ? ship_size * SIZE_TILE : SIZE_TILE,
                    is_horizontal ? SIZE_TILE : ship_size * SIZE_TILE };


    bool valid = check_available(grid_pos.x, grid_pos.y, ship_size, is_horizontal);

    SDL_SetRenderDrawColor(renderer,valid ? 255 : 255,valid ? 255 : 0,valid ? 255 : 0,50);

    SDL_RenderFillRect(renderer, &rect);
}

void Board::show_atk_feasibility(SDL_Renderer* renderer, SDL_Point pos)
{
    if (!move_in_board)
        return;

    SDL_Point grid_pos = { 0 };

    if (pos.x - board_render_x < -(SIZE_TILE / 2) || pos.y - board_render_y < -(SIZE_TILE / 2))
    {
        int g_pos_x = std::floor(double(pos.x - board_render_x) / SIZE_TILE);
        int g_pos_y = std::floor(double(pos.y - board_render_y) / SIZE_TILE);

        grid_pos = { g_pos_x,g_pos_y };
    }
    else
    {
        grid_pos =
        {
            (pos.x - board_render_x) / SIZE_TILE,
            (pos.y - board_render_y) / SIZE_TILE
        };
    }
    SDL_Rect rect;

    std::vector<SDL_Rect> highlight_rects;

    auto add_rect = [&](int gx, int gy) {
        if (gx < 0 || gx >= col || gy < 0 || gy >= row) return;
        highlight_rects.push_back
        ({
            board_render_x + gx * SIZE_TILE,
            board_render_y + gy * SIZE_TILE,
            SIZE_TILE,
            SIZE_TILE
            });
        };

    switch (skill_using)
    {
    case SkillType::NONE:
        // nothing
        break;
    case SkillType::Missile:
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 50);
        add_rect(grid_pos.x, grid_pos.y);
        break;
    case SkillType::Repair:
        SDL_SetRenderDrawColor(renderer, 255, 255, 0, 50);
        add_rect(grid_pos.x, grid_pos.y);
        break;
    case SkillType::Attack_3x3:
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 50);
        for (int j = grid_pos.y - 1; j <= grid_pos.y + 1; ++j)
            for (int i = grid_pos.x - 1; i <= grid_pos.x + 1; ++i)
                add_rect(i, j);
        break;
    case SkillType::Detect_3x3:
        SDL_SetRenderDrawColor(renderer, 50, 255, 255, 50);
        for (int j = grid_pos.y - 1; j <= grid_pos.y + 1; ++j)
            for (int i = grid_pos.x - 1; i <= grid_pos.x + 1; ++i)
                add_rect(i, j);
        break;
    case SkillType::Detect_13C:
        SDL_SetRenderDrawColor(renderer, 50, 255, 255, 50);
        for (int j = grid_pos.y - 1; j <= grid_pos.y + 1; ++j)
            for (int i = grid_pos.x - 1; i <= grid_pos.x + 1; ++i)

        add_rect(grid_pos.x - 2, grid_pos.y);
        add_rect(grid_pos.x + 2, grid_pos.y);
        add_rect(grid_pos.x, grid_pos.y - 2);
        add_rect(grid_pos.x, grid_pos.y + 2);
        break;
    case SkillType::Attack_5C:
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 50);
        add_rect(grid_pos.x, grid_pos.y);
        add_rect(grid_pos.x - 1, grid_pos.y);
        add_rect(grid_pos.x + 1, grid_pos.y);
        add_rect(grid_pos.x, grid_pos.y - 1);
        add_rect(grid_pos.x, grid_pos.y + 1);
        break;
    default:
        break;
    }

    for (auto& r : highlight_rects) {
        SDL_RenderCopy(renderer, tile_select, nullptr, &r);
        SDL_RenderFillRect(renderer, &r);
    }
}