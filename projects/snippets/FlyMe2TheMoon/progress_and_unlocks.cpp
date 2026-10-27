// Source: game/progress/progress.cpp
// https://github.com/Akil0814/FlyMe2TheMoon/blob/master/game/progress/progress.cpp

bool Progress::passed(int level)const {return level>=1&&level<=60&&stars[level-1]>=0;}
bool Progress::unlocked(int level,const content::Json& deps)const {
    if(level<1||level>60)return false;
    for(const auto& d:deps.at(std::to_string(level)))if(!passed(d.get<int>()))return false;
    return true;
}

// ... excerpt continues with Store::record_clear ...

bool Store::record_clear(int level,int stars_count,int collected,int crystal_count,int pickups,double elapsed) {
    if(level<1||level>60||stars_count<0||stars_count>3||elapsed<=0)throw std::invalid_argument("Invalid level clear result");
    std::array<bool,60> before{};
    const auto& dependencies=content::catalog().at("dependencies");
    for(int id=1;id<=60;++id)before[id-1]=data.unlocked(id,dependencies);
    const int i=level-1;data.stars[i]=std::max(data.stars[i],stars_count);
    for(int id=1;id<=60;++id)if(!before[id-1]&&data.unlocked(id,dependencies))pending_unlocks.insert(id);
    if(data.best_time[i]==0||elapsed<data.best_time[i])data.best_time[i]=elapsed;
    const int score=original_score(level,stars_count,collected,elapsed,content::catalog().at("score").at("svrs"));
    data.score_verified[i]=true;
    data.scores[i]=std::max(data.scores[i],score);data.crystals+=crystal_count;
    data.no_pickup_clear|=pickups==0;data.evaluate_achievements();return save();
}
