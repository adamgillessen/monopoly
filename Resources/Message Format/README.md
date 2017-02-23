### Client -> Server
ID is odd number

|ID|type|
|:-:|:-:|
|1  |player_join|
|3  |roll|
|5  |end_turn|
|7|buy|
|9|start\_game\_now|
|11|auction|
|13|auction\_bid|
|15|chat|

------

### Server -> Client
ID is even number

| ID | type | broadcast|
|:-:|:-:|:-:|
|  2 |player\_join\_ack   | yes|
|4  |board_sync| yes |
|6  |your\_turn| yes |
|8|roll\_result| yes |
|10|buy_ack| yes|
|12|auction_start|yes|
|14|auction\_bid\_ack|yes|
|16|auction\_finished|yes|
|18|chat\_sync|yes|
