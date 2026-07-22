class Scene : public elysia::core::Subject<SceneRequestObserver>
{
public:
    Scene() = default;
    virtual ~Scene() = default;

    Scene(const Scene&) = delete;
    Scene& operator=(const Scene&) = delete;

    Scene(Scene&&) = delete;
    Scene& operator=(Scene&&) = delete;

    virtual void on_enter(const ScenePayload& payload) = 0;
    virtual void on_exit() = 0;
    virtual void reset() = 0;

    virtual void on_update(double delta);
    virtual void on_render(SDL_Renderer* renderer);
    virtual void on_input(const elysia::input::RawInputFrame& input, const std::vector<elysia::input::RawInputEvent>& events);

    void pause() { _paused = true; }
    void resume() { _paused = false; }
    [[nodiscard]] const elysia::camera::Camera& camera() const noexcept;
    [[nodiscard]] elysia::camera::CameraSlot render_camera_slot() const noexcept;

    template <typename T, typename... Args>
    T* create_and_add_object(Args&&... args)
    {
        static_assert(
            std::is_base_of_v<elysia::core::GameObject, T> || std::is_base_of_v<elysia::ui::UiElement, T>,
            "T must derive from elysia::core::GameObject or elysia::ui::UiElement.");

        return add_object(std::make_unique<T>(std::forward<Args>(args)...)
        );
    }

    template <typename T>
    T* add_object(std::unique_ptr<T> object)
    {
        static_assert(
            std::is_base_of_v<elysia::core::SceneObject, T>,
            "T must derive from elysia::core::SceneObject.");

        static_assert(
            std::is_base_of_v<elysia::core::GameObject, T> || std::is_base_of_v<elysia::ui::UiElement, T>,
            "T must derive from elysia::core::GameObject or elysia::ui::UiElement.");

        if (!object)
            return nullptr;

        T* raw_object = object.get();
        bool added = false;

        if constexpr (std::is_base_of_v<elysia::core::GameObject, T>)
            added = add_game_object(std::move(object));
        else if constexpr (std::is_base_of_v<elysia::ui::UiElement, T>)
            added = add_ui_root(std::move(object));

        if (!added)
            return nullptr;

        register_scene_object_interfaces(raw_object);

        return raw_object;
    }

protected:
    void notify_scene_request(const SceneRequest& request);
    void request_scene_switch(const SceneRoute& route);
    void request_scene_switch(
        SceneKey target,
        const ScenePayload& payload = {},
        SceneReloadMode reload_mode = SceneReloadMode::Reuse
    );
    void request_quit();
    [[nodiscard]] const SceneRuntimeContext& runtime_context() const;
