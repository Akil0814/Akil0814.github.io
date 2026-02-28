int main(int argc, char** argv)
{
	GameManager* instance = GameManager::instance();
	return instance->run(argc, argv);
}

int GameManager::run(int argc, char** argv)
{
	Uint64 last_counter = SDL_GetPerformanceCounter();
	const Uint64 counter_freq = SDL_GetPerformanceFrequency();
	std::srand(static_cast<unsigned>(std::time(nullptr)));

	SceneManager::instance()->set_current_scene(ScenePool::instance()->get_scene(SceneType::Menu));

	while (!is_quit)
	{
		while (SDL_PollEvent(&event))
		{
			if (event.type == SDL_QUIT)
				is_quit = true;
			on_input(event);
		}

		Uint64 current_counter = SDL_GetPerformanceCounter();
		double delta = (double)(current_counter - last_counter) / counter_freq;
		last_counter = current_counter;

		if (delta * 1000 < 1000.0 / FPS)
			SDL_Delay((Uint32)(1000.0 / FPS - delta * 1000));

		on_update(delta);

		SDL_RenderClear(renderer);

		on_render();

		SDL_RenderPresent(renderer);
	}

	return 0;
}
