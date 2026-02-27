class Scene
{
public:
	Scene() = default;
	~Scene() = default;

	virtual void on_enter() {}
	virtual void on_update() {}
	virtual void on_draw() {}
	virtual void on_input(const ExMessage& msg) {}
	virtual void on_exit() {}

protected:
	int WINDOW_WIDTH=10;
	int WINDOW_HEIGHT=10;
};