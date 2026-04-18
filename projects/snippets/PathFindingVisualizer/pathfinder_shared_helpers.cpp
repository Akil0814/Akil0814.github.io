#include "path_finder.h"

#include <algorithm>
#include <cmath>

bool Pathfinder::read_endpoints(Point& start, Point& goal) const
{
    Board* current_board = board();
    if (current_board == nullptr)
        return false;

    start = current_board->get_start_point();
    goal = current_board->get_end_point();

    return current_board->in_bounds(start) && current_board->in_bounds(goal);
}

std::vector<Point> Pathfinder::neighbors(Point point) const
{
    Board* current_board = board();
    if (current_board == nullptr)
        return {};

    return current_board->neighbors(point, move_mode(), diagonal_policy());
}

int Pathfinder::movement_cost(Point from, Point to) const
{
    Board* current_board = board();
    if (current_board == nullptr)
        return 0;

    return current_board->movement_cost(from, to, tile_weight(to));
}

int Pathfinder::heuristic_cost(Point from, Point to, HeuristicMode mode) const
{
    MovementCostConfig config;
    if (Board* current_board = board())
        config = current_board->movement_cost_config();

    const int dx = std::abs(from.x - to.x);
    const int dy = std::abs(from.y - to.y);
    const int min_delta = std::min(dx, dy);
    const int max_delta = std::max(dx, dy);

    switch (mode)
    {
    case HeuristicMode::Manhattan:
        return config.straight * (dx + dy);
    case HeuristicMode::Euclidean:
        return static_cast<int>(std::round(config.straight * std::sqrt(dx * dx + dy * dy)));
    case HeuristicMode::Octile:
        return config.diagonal * min_delta + config.straight * (max_delta - min_delta);
    case HeuristicMode::Chebyshev:
        return config.straight * max_delta;
    default:
        return 0;
    }
}

void Pathfinder::set_tile_parent(Point child, Point parent)
{
    Board* current_board = board();
    if (current_board == nullptr || !current_board->in_bounds(child))
        return;

    current_board->tile_at(child).set_parent(parent);
}

void Pathfinder::set_tile_costs(Point point, int g_cost, int h_cost)
{
    Board* current_board = board();
    if (current_board == nullptr || !current_board->in_bounds(point))
        return;

    Tile& tile = current_board->tile_at(point);
    tile._g_cost = g_cost;
    tile._h_cost = h_cost;
    tile._f_cost = g_cost + h_cost;
}

void Pathfinder::mark_tile_current(Point point)
{
    Board* current_board = board();
    if (current_board == nullptr || !current_board->in_bounds(point) || is_start_or_goal(point))
        return;

    current_board->tile_at(point).change_status(Tile::Status::Current);
}

void Pathfinder::mark_tile_open(Point point)
{
    Board* current_board = board();
    if (current_board == nullptr || !current_board->in_bounds(point) || is_start_or_goal(point))
        return;

    current_board->tile_at(point).change_status(Tile::Status::Open);
}

void Pathfinder::mark_tile_closed(Point point)
{
    Board* current_board = board();
    if (current_board == nullptr || !current_board->in_bounds(point) || is_start_or_goal(point))
        return;

    current_board->tile_at(point).change_status(Tile::Status::Closed);
}

void Pathfinder::close_current_tile(Point& current)
{
    Board* current_board = board();
    if (current_board == nullptr || !current_board->in_bounds(current))
        return;

    mark_tile_closed(current);
    current = { -1, -1 };
}

bool Pathfinder::rebuild_path(Point start, Point goal)
{
    Board* current_board = board();
    if (current_board == nullptr)
        return false;

    Point current = goal;
    int guard = current_board->row_count() * current_board->col_count();

    while (!same_point(current, start) && guard-- > 0)
    {
        if (!current_board->in_bounds(current))
            return false;

        const Point parent = current_board->tile_at(current).get_parent();
        if (!same_point(current, goal))
            mark_tile_path(current);

        current = parent;
    }

    return same_point(current, start);
}
