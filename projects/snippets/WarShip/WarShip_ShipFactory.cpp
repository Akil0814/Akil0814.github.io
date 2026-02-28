class ShipFactory
{
public:
	static ShipFactory* instance()
	...

	Ship* creat_ship(ShipType type,Board* player_board);
	...
};

Ship* ShipFactory::creat_ship(ShipType type,Board* board)
{
	if (board == nullptr)
		return nullptr;

	Ship* new_ship = nullptr;

	switch (type)
	{
	case ShipType::Destroyer:
		new_ship=new Destroyer;

		break;
	case ShipType::LightCruiser:
		new_ship = new LightCruiser;
	...
	
	default:
		break;
	}

	new_ship->init_pos(ship_pos);
	new_ship->set_board_in(board);

	return new_ship;
}

...