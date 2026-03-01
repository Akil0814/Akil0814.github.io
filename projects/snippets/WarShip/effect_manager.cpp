typedef std::unordered_map<EffectID, Effect*> EffectPool;
typedef std::vector<std::unique_ptr<Effect>> EffectOnPlay;

class EffectManager:public Manager<EffectManager>
{
	friend class Manager<EffectManager>;
public:

	void on_update(double delta);
	void on_render(SDL_Renderer* renderer);

	bool init_all_effect();

	void show_effect(EffectID effect_type,const SDL_Point postion, double angle);
	void show_effect(EffectID effect_type, const SDL_Point postion, double angle, std::function<void()>);
	void show_effect(EffectID effect_type,const SDL_Rect rect, double angle);
	void show_effect(EffectID effect_type, const SDL_Rect rect, double angle,std::function<void()>);

	void set_on_finished(EffectID effect_type,std::function<void()>);


protected:
	EffectManager();
	~EffectManager();
private:
	EffectOnPlay effect_on_play;
	EffectPool effect_pool;
};

void EffectManager::on_update(double delta)
{
	for (auto& effect : effect_on_play)
		effect->on_update(delta);

	auto it = std::remove_if(effect_on_play.begin(), effect_on_play.end(),
		[](auto& e) { return e->is_finished(); });
	effect_on_play.erase(it, effect_on_play.end());
}

void EffectManager::show_effect(EffectID effect_type,const SDL_Rect rect, double angle,std::function<void()> finished)
{
	auto effect_prototype = effect_pool.find(effect_type);

	if (effect_prototype == effect_pool.end())
	{
		SDL_LogError(SDL_LOG_CATEGORY_APPLICATION, "Effect ID %d can't found", int(effect_type));
		return;
	}

	std::unique_ptr<Effect> new_effect = effect_prototype->second->clone();
	new_effect->set_play_data(rect, angle);
	new_effect->set_on_finished(finished);
	effect_on_play.push_back(std::move(new_effect));
}

bool EffectManager::init_all_effect()
{

	Effect* e = new Effect;
	e->set_frame(AtlasManager::instance()->get_atlas(AtlasID::GetTarget));
	e->set_interval(0.15);
	e->set_loop(false);
	effect_pool[EffectID::SelectTarget] = e;

	...


	for (const auto& pair : effect_pool)
	{
		if (!pair.second)
			return false;
	}

	return true;
}

...