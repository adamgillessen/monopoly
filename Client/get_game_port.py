#!/usr/bin python3

if __name__ == "__main__":
    with open("current_game_port.dat") as f:
        try:
            portnumber = f.read().strip()
            print(portnumber)
        except FileNotFoundError:
            print("get_game_port.py: current_game_port.dat was not found")
        except PermissionError:
            print("get_game_port.py: Could not open current_game_port.dat; incorrect permissions")