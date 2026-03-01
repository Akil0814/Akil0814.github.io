class MineBoard
{
public:
    ... other member functions ...

	void set_mine(const int index_x,const int index_y)
	{
		int count = num_of_mine;

			board_mine[index_x][index_y] = KEEP_SPACE_EMPTY;
			if (15 < (row_show * col_show) - num_of_mine)
			{
				board_mine[index_x + 1][index_y] = KEEP_SPACE_EMPTY;
				board_mine[index_x - 1][index_y] = KEEP_SPACE_EMPTY;
				board_mine[index_x][index_y + 1] = KEEP_SPACE_EMPTY;
				board_mine[index_x][index_y - 1] = KEEP_SPACE_EMPTY;
				board_mine[index_x - 1][index_y - 1] = KEEP_SPACE_EMPTY;
				board_mine[index_x + 1][index_y - 1] = KEEP_SPACE_EMPTY;
				board_mine[index_x - 1][index_y + 1] = KEEP_SPACE_EMPTY;
				board_mine[index_x + 1][index_y + 1] = KEEP_SPACE_EMPTY;
			}

		while (count>0)
		{
			int x = (rand() % row_show +1);
			int y = (rand() % col_show +1);
			if (board_mine[x][y] == 0)
			{
				board_mine[x][y] = IS_MINE;
				count--;
			}
		}

			board_mine[index_x][index_y] = RESET;
			if (15 < (row_show * col_show) - num_of_mine)
			{
				board_mine[index_x + 1][index_y] = RESET;
				board_mine[index_x - 1][index_y] = RESET;
				board_mine[index_x][index_y + 1] = RESET;
				board_mine[index_x][index_y - 1] = RESET;
				board_mine[index_x - 1][index_y - 1] = RESET;
				board_mine[index_x + 1][index_y - 1] = RESET;
				board_mine[index_x - 1][index_y + 1] = RESET;
				board_mine[index_x + 1][index_y + 1] = RESET;
			}

		for (int i = 1; i <= row_show; i++)
		{
			for (int j = 1; j <= col_show; j++)
				board_num[i][j] = (get_mine_count(i, j));
		}
	}

	void check_mine(const int x,const int y)
	{
		if (board_mine[x][y] == IS_EMPTY && board_show[x][y] == IS_EMPTY)
		{
			board_show[x][y] = IS_CHEAKED;
			num_of_cover--;
			int num = board_num[x][y];
			if (num == 0)
			{
				check_around(x,y);
			}
		}
		else if (board_mine[x][y] == IS_MINE && board_show[x][y] == IS_EMPTY)
		{
			is_game_end = true;
		}
	}

	void set_flag(const int x,const int y)
	{
		if (board_show[x][y] == IS_EMPTY)
		{
			board_show[x][y] = IS_FLAG;
			num_of_flag++;
			if(num_of_mine_left>0)
				num_of_mine_left--;

		}
		else if (board_show[x][y] == IS_FLAG)
		{
			board_show[x][y] = IS_EMPTY;
			num_of_flag--;
			if ( num_of_flag<num_of_mine)
				num_of_mine_left++;
		}
	}

private:

	void check_around(int x, int y)
	{
		if (x + 1 <= row_show && board_show[x + 1][y] != IS_CHEAKED)
			check_mine(x + 1, y);
		if (x - 1 > 0 && board_show[x - 1][y] != IS_CHEAKED)
			check_mine(x - 1, y);
		if (y + 1 <= col_show && board_show[x][y + 1] != IS_CHEAKED)
			check_mine(x, y + 1);
		if (y - 1 > 0 && board_show[x][y - 1] != IS_CHEAKED)
			check_mine(x, y - 1);

		if (x - 1 > 0 && y - 1 > 0 && board_show[x - 1][y - 1] != IS_CHEAKED)
			check_mine(x - 1, y - 1);
		if (x - 1 > 0 && y + 1 <= col_show && board_show[x - 1][y + 1] != IS_CHEAKED)
			check_mine(x - 1, y + 1);
		if (x + 1 <= row_show && y - 1 > 0 && board_show[x + 1][y - 1] != IS_CHEAKED)
			check_mine(x + 1, y - 1);
		if (x + 1 <= row_show && y + 1 <= col_show && board_show[x + 1][y + 1] != IS_CHEAKED)
			check_mine(x + 1, y + 1);
	}

	int get_mine_count(const int x, const int y)const
	{
		if (x<1 || x>row_show || y<1 || y>col_show)
			return -1;

		return	board_mine[x - 1][y] +
			board_mine[x - 1][y - 1] +
			board_mine[x][y - 1] +
			board_mine[x + 1][y - 1] +
			board_mine[x + 1][y] +
			board_mine[x + 1][y + 1] +
			board_mine[x][y + 1] +
			board_mine[x - 1][y + 1];
	}

private:
    ... other member variables ...
};