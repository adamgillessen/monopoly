pi="pi@adamgillessen.ddns.net:/var/www/html/"
pi_server="pi@adamgillessen.ddns.net:/home/pi/monopoly_server/"
netsoc="gilly@leela.netsoc.co:/home/gilly/public_html/"

scp ./index.html "$pi"index.html
scp -r ./data "$pi"data
scp -r ./images "$pi"images
scp -r ./js "$pi"js
scp -r ./lib "$pi"lib
scp -r ./scss "$pi"scss

cd ../Server/
pwd
scp *.py "$pi_server"