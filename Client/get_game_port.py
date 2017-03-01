#!/usr/bin/python3
print()
if __name__ == "__main__":
    port_file = "/home/pi/monopoly_server/current_game_port.dat" # TODO decide on where to put stuff permanently
    with open(port_file) as f:
        try:
            portnumber = f.read().strip()
            print(portnumber)
        except FileNotFoundError:
            print("get_game_port.py: current_game_port.dat was not found")
        except PermissionError:
            print("get_game_port.py: Could not open current_game_port.dat; incorrect permissions")