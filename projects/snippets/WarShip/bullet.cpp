class Bullet {
public:
    Bullet();
    ~Bullet();

    void fire(const SDL_Point& start, const SDL_Point& end, double spd, Board* board, SDL_Point index);
    void on_update(double delta);
    void on_render(SDL_Renderer* renderer) const;
    void on_arrive();

    bool is_valid() const;
    SDL_Point get_end_pos()const;

private:
    Animation animation;
    ...
}

void Bullet::on_arrive()
{
    std::cout << "change 3" << std::endl;
    Board* board = effect_board;
    SDL_Point index = effect_index;

    if (!board) return;
    if (effect_board->get_tile_board()[effect_index.y][effect_index.x].has_ship()&&
        effect_board->get_tile_board()[effect_index.y][effect_index.x].get_status()!=Tile::Status::Sink)
    {
        SDL_Rect rect_explosion_target = {
        end_pos.x-30,end_pos.y-50,
        SIZE_TILE + 40, SIZE_TILE + 40 };


        EffectManager::instance()->show_effect(EffectID::Explosion1, rect_explosion_target, 0, [board,index]()
            {
                board->get_tile_board()[index.y][index.x].take_hit();
            });
        switch (rand() % 3)
        {
        case 0:
            Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Explosion_1), 0);
            break;
        case 1:
            Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Explosion_2), 0);
            break;
        case 2:
            Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Explosion_3), 0);
            break;
        }

        if (board->get_tile_board()[index.y][index.x].get_status() == Tile::Status::Defend)
        {
            SDL_Rect rect_defend_target = {
                    end_pos.x - 15,end_pos.y - 25,
                    SIZE_TILE, SIZE_TILE+10 };
            EffectManager::instance()->show_effect(EffectID::Shield, rect_defend_target, 0, []() {});
        }
    }
    else if(!effect_board->get_tile_board()[effect_index.y][effect_index.x].has_ship())
    {
        SDL_Rect rect_water_splash = {
        end_pos.x- 35,end_pos.y-15,
        SIZE_TILE + 40, SIZE_TILE
        };

        Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_Entering_Water), 0);
        EffectManager::instance()->show_effect(EffectID::WaterSplash, rect_water_splash, 0, [board,index]()
            {
                board->get_tile_board()[index.y][index.x].change_status(Tile::Status::Miss);
            });
    }
    else if (effect_board->get_tile_board()[effect_index.y][effect_index.x].get_status() == Tile::Status::Sink)
    {
        SDL_Rect rect_water_splash = {
        end_pos.x - 35,end_pos.y - 15,
        SIZE_TILE + 40, SIZE_TILE
        };

        Mix_PlayChannel(-1, ResourcesManager::instance()->get_sound(ResID::Sound_UnderWater_Explosion), 0);
        EffectManager::instance()->show_effect(EffectID::WaterSplash, rect_water_splash, 0, [board, index]()
            {
            });
    }

}
...
