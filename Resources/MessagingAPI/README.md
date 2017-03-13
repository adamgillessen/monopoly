### Client -> Server

* player_join    
* roll       
* end_turn     
* buy        
* start\_game\_now 
* auction      
* auction\_bid   
* chat       
* build\_house   
* pay\_bail
* mortgage_property

### Server -> Client

* player\_join\_ack
* board_sync    
* your\_turn    
* roll\_result   
* buy_ack     
* auction_start  
* auction\_bid\_ack
* auction\_finished
* chat\_sync    
* player\_lose   
* textual\_update  
* build\_ack    
* mortgage\_property\_ack

-------

# Time Sequence Diagrams

### General Flow of Game:
![Game Flow](./images/take_turn.png)

### Buying and Auctioning Property:
![Buy Auction](./images/buy_auction.png)

### Building Houses on Property:
![Building Houses](./images/build_house.png)

### Mortgaging Property;
![Mortgage Property](./images/mortgage_property.png)

### Getting Out of Jail:
![Leave Jail](./images/leave_jail.png)

### In Game Chat:
![Chat](./images/player_chat.png)

### Special Textual Updates:
![Text](./images/textual_update.png)

### When a Player Loses:
![Lose](./images/player_lose.png)