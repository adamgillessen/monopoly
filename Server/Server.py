import websocket_server
import json

class Server:
    """
    This class is a server that will handle multiple asynchronous cleints
    connecting through websockets. 
    """

    CLIENT_ID = 1

    def __init__(self, hostname, portnumber):
        self._ws = websocket_server.WebsocketServer(portnumber, hostname)
        self._ws.set_fn_new_client(Server.new_client)
        self._ws.set_fn_message_received(Server.recv_message)
        self._client_keys = {}

    @staticmethod
    def new_client(client, server):
        """
        This function will be run when a new client connects to the server. 
        client - the new client object
        server - the server object
        """
        print("A new client {} has joined".format(client))
    

    @staticmethod
    def recv_message(client, server, message):
        """
        This function will be run when a message is recieved from one of
        the connected clients. 
        """
        print("Received: {}".format(message))
        json_string = json.loads(message)
        if json_string["type"] == "player_join":
            self._client_keys[client] = json_string["key"]
            type_ = "player_join_ack"
            key = json_string["key"]
            your_id = Server.CLIENT_ID
            Server.CLIENT_ID += 1
            current_player = len(self._client_keys)
            expects = 4
            game_start = False

            response_json = {
                "type": type_,
                "key": key,
                "your_id":your_id,
                "current_player": current_player,
                "expects":expects,
                "game_start": game_start,
            }
            response_json_string = json.dumps(response_json)
            self._ws.send_message_to_all(response_json_string.encode("utf-8"))

    def start(self):
        """
        This starts the server running forever. 
        """
        server.run_forever()