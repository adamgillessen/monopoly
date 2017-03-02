cd js
jsdoc *.js 
rm -r ./../../docs/Client/*
mv ./out/* ./../../docs/Client
rm -r ./out