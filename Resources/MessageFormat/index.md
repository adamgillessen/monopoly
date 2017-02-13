### Client -> Server
ID is odd number

|ID|type|
|:-:|:-:|
|1  |player_join|
|3  |roll|
|5  |end_turn|
|7|buy|

------

### Server -> Client
ID is even number

| ID | type | boardcast|
|:-:|:-:|:-:|
|  2 |player\_join\_ack   | yes|
|4  |board_sync| yes |
|6  |your_turn| yes |
|8|roll_result| yes |
|10|buy_ack| yes|
