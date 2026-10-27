// Source: game/application/game_module.cpp
// https://github.com/Akil0814/FlyMe2TheMoon/blob/master/game/application/game_module.cpp

    void GameModule::register_scenes(elysia::scene::SceneManager& scene_manager) const
    {
        scene_manager.register_game_scene<game::scene::MainMenuScene>(game::scene_keys::MainMenu);
        scene_manager.register_game_scene<game::scene::FlightScene>(game::scene_keys::Flight);
        scene_manager.register_game_scene<game::scene::SelectionScene>(game::scene_keys::Selection);
        scene_manager.register_game_scene<game::scene::CreditsScene>(game::scene_keys::Credits);
        scene_manager.register_game_scene<game::scene::AchievementsScene>(game::scene_keys::Achievements);
        scene_manager.register_game_scene<game::scene::SettingsScene>(game::scene_keys::Settings);
    }
