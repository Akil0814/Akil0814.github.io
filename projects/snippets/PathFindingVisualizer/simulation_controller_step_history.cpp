#include "simulation_controller.h"

#include <algorithm>
#include <utility>

void SimulationController::on_update(double delta)
{
    if (!_auto_run || _current_play_mod != PlayMode::AutoRun)
        return;

    _timer += delta;

    constexpr int max_steps_per_frame = 64;
    int steps_this_frame = 0;

    while (_timer >= _step_interval &&
        _auto_run &&
        _current_play_mod == PlayMode::AutoRun &&
        steps_this_frame < max_steps_per_frame)
    {
        _timer -= _step_interval;
        next_step();
        ++steps_this_frame;
    }

    if (steps_this_frame == max_steps_per_frame)
        _timer = 0.0;
}

void SimulationController::next_step()
{
    if (_board == nullptr)
        return;

    if (_path_finder == nullptr)
        create_path_finder();

    if (_path_finder == nullptr || _path_finder->is_finished())
    {
        set_auto_run(false);
        return;
    }

    set_board_edit_locked(true);
    save_history_state();
    _board->save_snapshot();
    _path_finder->next_step();
    ++_total_steps;

    if (_path_finder->is_finished())
    {
        _total_cost = _path_finder->found_path() ? _board->path_cost() : 0;
        _path_steps = _path_finder->found_path() ? _board->path_steps() : 0;
        set_auto_run(false);
    }
}

bool SimulationController::previous_step()
{
    if (_board == nullptr || _history.empty())
        return false;

    if (!_board->undo())
        return false;

    HistoryState state = std::move(_history.back());
    _history.pop_back();

    _path_finder = std::move(state.path_finder);
    if (_path_finder != nullptr)
    {
        _path_finder->bind_board(_board);
        _path_finder->set_move_mode(_move_mode);
        _path_finder->set_diagonal_policy(_diagonal_policy);
    }

    _auto_run = false;
    _current_play_mod = PlayMode::Pause;
    _timer = 0.0;
    _total_cost = state.total_cost;
    _total_steps = state.total_steps;
    _path_steps = state.path_steps;

    set_board_edit_locked(true);
    return true;
}

void SimulationController::save_history_state()
{
    HistoryState state;
    state.path_finder = _path_finder != nullptr ? _path_finder->clone() : nullptr;
    state.play_mode = _current_play_mod;
    state.timer = _timer;
    state.total_cost = _total_cost;
    state.total_steps = _total_steps;
    state.path_steps = _path_steps;

    _history.push_back(std::move(state));
}
