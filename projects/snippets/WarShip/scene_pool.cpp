class ScenePool
{
public:
	static ScenePool* instance()
	...

	Scene* get_scene(SceneType type);
	
	void delete_scene(SceneType type);

private:
	...

	bool cheek_invalid(Scene* scene);
};

Scene* ScenePool::get_scene(SceneType type)
{
	switch (type)
	{
	case SceneType::Menu:
		if (cheek_invalid(menu_scene))
			menu_scene = new MenuScene;
		return menu_scene;
		break;
	...

	default:
		return nullptr;
		break;
	}

	return nullptr;
}

...