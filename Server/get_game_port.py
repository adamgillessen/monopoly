#!/usr/bin python3

if __name__ == "__main__":
    dat_file_location = "current_game_port.dat" # TODO decide on where to put stuff permanently
    with open(dat_file_location) as f:
        try:
            portnumber = f.read().strip()
            print(portnumber)
        except FileNotFoundError:
            print("get_game_port.py: current_game_port.dat was not found")
        except PermissionError:
            print("get_game_port.py: Could not open current_game_port.dat; incorrect permissions")