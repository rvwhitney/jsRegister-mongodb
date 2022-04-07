#!/bin/bash
# change these
IP=192.168.1.0
PORT=8080
cd /path/to/app
# end change these

if nc -zv $IP $PORT
then
echo 'ok'
else
echo 'restarting the app'
nodemon app.js < /dev/null > startup.log 2> err.log &
fi
echo 'done'
