# jsRegister
a checkbook register running on node js

## This app is meant to be run on a local network - there is no login or authentication
## it assumes you know mongodb

You will need to make several changes in config.js, the main configuration file to suit your app

### Install node js

see https://phoenixnap.com/kb/update-node-js-version

### Install nodemon globally with
* sudo npm i nodemon -g
* npm i
* to pull the node_modules, which are not included in this repo

### unpack the app at your desired location

get a free cert from let's encrypt https://letsencrypt.org and install it at your desired location (can be in the root of your app)

cd /home/your/node/location

### Edit nodestart.sh to suit

run ./nodestart.sh

### navigate to https://your.local.domain:port

add events by using the form given

if you have any issues with this app, submit an issue
