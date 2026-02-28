class SceneManager
{
public:
	enum class SceneType
	{
		Menu,
		Game,
		Selector
	};

public:
	SceneManager() = default;
	~SceneManager() = default;

	void set_current_scene(Scene* scene)
	{
		current_scene = scene;
		current_scene->on_enter();
	}

	void switch_to(SceneType type)
	{
		current_scene->on_exit();
		switch (type)
		{
			...
		}
		current_scene->on_enter();
	}

	void on_update()
	{
		current_scene->on_update();
	}
	
	void on_draw()
	{
		current_scene->on_draw();
	}
	
	void on_input(const ExMessage& msg)
	{
		current_scene->on_input(msg);
	}

private:

	Scene* current_scene = nullptr;
};