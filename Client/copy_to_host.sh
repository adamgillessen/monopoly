pi_client="pi@adamgillessen.ddns.net:/var/www/html/"
pi_server="pi@adamgillessen.ddns.net:/home/pi/monopoly_server/"
netsoc_client="gilly@leela.netsoc.co:/media/thor/home/gilly/public_html/"
netsoc_server="gilly@leela.netsoc.co:/home/gilly/monopoly_server"

client_location=$netsoc_client
server_location=$netsoc_server


scp ./index.html "$client_location"index.html
scp -r ./data "$client_location"data
scp -r ./images "$client_location"images
scp -r ./js "$client_location"js
scp -r ./lib "$client_location"lib
scp -r ./scss "$client_location"scss

cd ../Server/
scp *.py "$server_location"