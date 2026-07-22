#pragma once

#include "scene_key.h"
#include "scene_payload.h"

namespace elysia::scene
{
enum class SceneReloadMode
{
    Reuse,
    Reset,
    Recreate
};

struct SceneRoute
{
    SceneKey target = SceneKeys::Invalid;
    ScenePayload payload{};
    SceneReloadMode reload_mode = SceneReloadMode::Reuse;
};
}

// ---- engine/scene/routing/scene_request.h ----
#pragma once

#include "scene_route.h"

namespace elysia::scene
{
enum class SceneRequestType
{
    None,
    Switch,
    Quit
};

struct SceneRequest
{
    SceneRequestType type = SceneRequestType::None;
    SceneRoute route{};
};

}
