pi_client="pi@adamgillessen.ddns.net:/var/www/html/"
pi_server="pi@adamgillessen.ddns.net:/var/www/monopoly_server/"
netsoc_client="gilly@leela.netsoc.co:/media/thor/home/gilly/public_html/"
netsoc_server="gilly@leela.netsoc.co:/media/thor/home/gilly/monopoly_server/"

if [ "$1" = "netsoc" ]
then
    client_location=$netsoc_client
    server_location=$netsoc_server
    echo ">> Sending to netsoc server"
elif [ "$1" = "pi" ]    
then
    client_location=$pi_client
    server_location=$pi_server
    echo ">> Sending to pi server"
else
    echo ">> copy_to_host.sh <pi|netsoc> <client|server|both>"
    exit
fi

if [ "$2" != "client" ] && [ "$2" != "server" ] && [ "$2" != "both" ]
then
    echo ">> copy_to_host.sh <pi|netsoc> <client|server|both>"
    exit
fi

cd Client 

if [ "$2" = "client" ] || [ "$2" = "both" ]
then
    echo ">> Sending client.."
    scp ./index.html "$client_location"index.html
    scp ./get_game_port.py "$client_location"get_game_port.py
    scp -r ./data "$client_location"data
    scp -r ./images "$client_location"images
    scp -r ./js "$client_location"js
    scp -r ./lib "$client_location"lib
    scp -r ./scss "$client_location"scss
fi

cd ./../Server/

if [ "$2" = "server" ] || [ "$2" = "both" ]
then
echo ">> Sending server.."
    scp *.py "$server_location"
fi