void SceneManager::on_scene_request(const SceneRequest& request)
{
    // Scene requests are only valid during normal input/update execution.
    // They must not be emitted from on_enter(), on_exit(), on_render(), reset(),
    // or destructors. Those phases are part of scene lifecycle management, not
    // scene flow decision-making.

    // A processing cycle may queue at most one scene request.
    // Reentrant requests while dispatching are also treated as programmer errors.

    if (_is_processing_request)
        throw std::logic_error("SceneManager received a reentrant scene request while processing another request.");


    if (_has_pending_request)
        throw std::logic_error("SceneManager received multiple scene requests in a single processing cycle.");

    _pending_request = request;
    _has_pending_request = true;
}

void SceneManager::notify_quit_requested()
{
    notify_observers(
        [](SceneManagerObserver& observer)
        {
            observer.on_scene_manager_quit_requested();
        }
    );
}

void SceneManager::process_pending_request()
{
    if (!_has_pending_request)
        return;

    struct ProcessingRequestGuard
    {
        bool& flag;

        explicit ProcessingRequestGuard(bool& processing_flag)
            : flag(processing_flag)
        {
            flag = true;
        }

        ~ProcessingRequestGuard()
        {
            flag = false;
        }
    };

    const SceneRequest request = _pending_request;

    _pending_request = SceneRequest{};
    _has_pending_request = false;

    ProcessingRequestGuard processing_guard(_is_processing_request);

    switch (request.type)
    {
    case SceneRequestType::Switch:
        switch_to_registered_scene(request.route);
        break;

    case SceneRequestType::Quit:
        notify_quit_requested();
        break;

    case SceneRequestType::None:
    default:
        break;
    }
}

void SceneManager::switch_to_registered_scene(
    const SceneRoute& route
)
{
    if (!SceneKeys::is_supported(route.target))
        throw_invalid_route_key(route.target);

    ELYSIA_LOG(
        "scene",
        "Switching to SceneKey " << route.target
        << " with reload mode "
        << static_cast<int>(route.reload_mode));

    const auto iter = _scene_providers.find(route.target);

    if (iter == _scene_providers.end())
    {
        if (SceneKeys::is_game(route.target))
            throw std::logic_error("SceneManager received a valid but unregistered game SceneKey.");

        throw std::logic_error("SceneManager received a valid but unregistered engine-owned SceneKey.");
    }

    Scene* next_scene = iter->second(route.reload_mode);

    switch_to_scene(next_scene, route);
}

void SceneManager::switch_to_scene(
    Scene* next_scene,
    const SceneRoute& route
)
{
    if (!next_scene)
        throw std::logic_error("SceneManager::switch_to_scene received a null scene from provider.");

    if (_runtime_context)
        next_scene->bind_runtime_context(*_runtime_context);

    if (_current_scene == next_scene)
    {
        detach_from_scene(_current_scene);
        _current_scene->on_exit();

        elysia::tools::DebugDraw::instance()->clear();

        if (route.reload_mode == SceneReloadMode::Reset)
        {
            elysia::camera::CameraManager::instance()->reset(
                elysia::camera::CameraSlot::Main
            );
            _current_scene->reset();
        }

        attach_to_scene(_current_scene);
        _current_scene_key = route.target;
        _current_scene->on_enter(route.payload);
        return;
    }

    if (_current_scene)
    {
        detach_from_scene(_current_scene);
        _current_scene->on_exit();
    }

    elysia::tools::DebugDraw::instance()->clear();

    elysia::camera::CameraManager::instance()->reset(
        elysia::camera::CameraSlot::Main
    );

    _current_scene = next_scene;
    _current_scene_key = route.target;

    if (route.reload_mode == SceneReloadMode::Reset)
        _current_scene->reset();

    attach_to_scene(_current_scene);
    _current_scene->on_enter(route.payload);
}

void SceneManager::throw_invalid_route_key(SceneKey key)
{
    if (key == SceneKeys::Invalid)
        throw std::logic_error("SceneManager received SceneKeys::Invalid.");

    throw std::logic_error("SceneManager received a SceneKey in the reserved range.");
