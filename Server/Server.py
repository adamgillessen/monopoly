from websocket_server

class Server:
    """
    This class is a server that will handle multiple asynchronous cleints
    connecting through websockets. 
    """
    def __init__(self, hostname, portnumber):
        self._server = websocket_server.WebsocketServer(portnumber, hostname)
        self._server.set_fn_new_client(Server.new_client)
        self._server.set_fn_message_received(Server.recv_message)

    @staticmethod
    def new_client(client, server):
        """
        This function will be run when a new client connects to the server. 
        client - the new client object
        server - the server object
        """
        server.send_message_to_all("Hey all, a new client has joined us")
    

    @staticmethod
    def recv_message(client, server, message):
        print("Received: {}".format(message))
        server.send_message(client, message.upper().encode("utf-8"))

    def start(self):
        """
        This starts the server running forever. 
        """
        server.run_forever()