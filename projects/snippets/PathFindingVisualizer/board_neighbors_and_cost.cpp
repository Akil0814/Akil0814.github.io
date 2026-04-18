#include "board.h"

#include <cmath>
#include <vector>

std::vector<Point> Board::neighbors(Point index, MoveMode move_mode, DiagonalMovePolicy policy) const
{
    std::vector<Point> result;
    result.reserve(move_mode == MoveMode::EightWay ? 8 : 4);

    const Point directions_4[] =
    {
        { 1, 0 },
        { -1, 0 },
        { 0, 1 },
        { 0, -1 }
    };

    for (const Point direction : directions_4)
    {
        const Point next = { index.x + direction.x, index.y + direction.y };
        if (is_valid_tile_index(next) && _board[next.y][next.x].get_status() != Tile::Status::Wall)
            result.push_back(next);
    }

    if (move_mode != MoveMode::EightWay)
        return result;

    const Point directions_diagonal[] =
    {
        { 1, 1 },
        { 1, -1 },
        { -1, 1 },
        { -1, -1 }
    };

    for (const Point direction : directions_diagonal)
    {
        const Point next = { index.x + direction.x, index.y + direction.y };
        if (!is_valid_tile_index(next) || _board[next.y][next.x].get_status() == Tile::Status::Wall)
            continue;

        const Point side_x = { index.x + direction.x, index.y };
        const Point side_y = { index.x, index.y + direction.y };
        const bool side_x_blocked = _board[side_x.y][side_x.x].get_status() == Tile::Status::Wall;
        const bool side_y_blocked = _board[side_y.y][side_y.x].get_status() == Tile::Status::Wall;

        if (policy == DiagonalMovePolicy::BlockIfEitherSideBlocked &&
            (side_x_blocked || side_y_blocked))
        {
            continue;
        }

        if (policy == DiagonalMovePolicy::BlockIfBothSidesBlocked &&
            side_x_blocked && side_y_blocked)
        {
            continue;
        }

        result.push_back(next);
    }

    return result;
}

int Board::movement_cost(Point from, Point to, int weight) const
{
    const int dx = std::abs(from.x - to.x);
    const int dy = std::abs(from.y - to.y);
    const bool diagonal = dx != 0 && dy != 0;
    const int base_cost = diagonal ? _movement_cost_config.diagonal : _movement_cost_config.straight;

    return base_cost * weight;
}

int Board::path_cost() const
{
    if (!is_valid_tile_index(_start_pos_index) || !is_valid_tile_index(_end_pos_index))
        return 0;

    int cost = 0;
    int guard = _row * _col;
    Point current = _end_pos_index;

    while (is_valid_tile_index(current) && guard-- > 0)
    {
        if (current.x == _start_pos_index.x && current.y == _start_pos_index.y)
            return cost;

        const Tile& tile = _board[current.y][current.x];
        const Point parent = tile.get_parent();
        if (!is_valid_tile_index(parent))
            return 0;

        cost += movement_cost(parent, current, tile._weight);
        current = parent;
    }

    return 0;
}

int Board::path_steps() const
{
    if (!is_valid_tile_index(_start_pos_index) || !is_valid_tile_index(_end_pos_index))
        return 0;

    int steps = 0;
    int guard = _row * _col;
    Point current = _end_pos_index;

    while (is_valid_tile_index(current) && guard-- > 0)
    {
        if (current.x == _start_pos_index.x && current.y == _start_pos_index.y)
            return steps;

        const Point parent = _board[current.y][current.x].get_parent();
        if (!is_valid_tile_index(parent))
            return 0;

        ++steps;
        current = parent;
    }

    return 0;
}
