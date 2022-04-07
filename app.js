/*
 * app.js
 * Author: Richard Whitney
 * Date: 2021-04-23
 *
 * */
Object.defineProperty(global, '__stack__', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line__', {
  get: function(){
    return __stack__[1].getLineNumber();
  }
});


'use strict';
var exec              = require('child_process').exec;
const spdy            = require('spdy');
var express           = require('express');
var fs                = require('fs');
var app               = express(),
    https             = require('https'),
    http              = require('http') ;

var config            = require('./config');
var ejs               = require('ejs');

//~ const { MongoClient, ServerApiVersion } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
//~ const uri = "mongodb+srv://ruusvuu:"+config.dbpassword+"@cluster0.pyvrw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = "mongodb://your.ip/"+config.database+"?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//~ const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);


app.use(function(req, res, next){
  res.set({
    'strict-transport-security': 'max-age=31536000',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  next();
})

/*
 * app variables that are not node modules
 * */
var appPort = config.port,
    sockets = {},
    host    = config.host;

app.use(express.static("html"));

app.use(function(req,res,next){
  res.locals.ip = req.ip;
  console.log(__line__, res.locals.ip);
  next();
});

// js, css, images etc.
app.get('/include/:path/:file', function (req, res) {
  if(fs.existsSync( __dirname + '/html/' + req.params.path + '/' + req.params.file)){
    res.sendFile( __dirname + '/html/' + req.params.path + '/' + req.params.file);
  } else {
        res.render('index',{filename:'404',url:req.url,heading:''});
    }
});

app.get('/scripts/:mod/:file', function(req,res){
  switch(req.params.mod){
    case 'jquery':res.sendFile(__dirname + '/node_modules/jquery/dist/' + req.params.file);break;
    case 'socket.io':res.sendFile(__dirname + '/node_modules/socket.io/client-dist/' + req.params.file);break;
  }
});

var port = process.env.PORT || appPort;
console.log(__line__,  port, host );

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('view cache', false);

var certpath = config.certpath;
var options = {
    key     : fs.readFileSync(certpath + config.certKey),
    cert    : fs.readFileSync(certpath + config.cert)
}

app.get('/favicon.ico',function(req,res){
    res.send('');
});

app.get('/images/favicon.png', function (req, res) {
    //~ res.sendFile( __dirname + '/html/images/favicon.png');
    res.sendFile( __dirname + '/html/images/' + config.favicon);
});

app.get('/',function(req,res){
    var date = new Date();
    res.render('index',{
      filename: __dirname + '/views/index',
      heading:'headings/blank',
      sitename: config.sitename,
      year: date.getFullYear(),
      port: config.port
    });

});
const { Server }        = require("socket.io");
const httpServer = https.createServer(options, app);
const io = new Server(httpServer, {maxHttpBufferSize: 102400000});
httpServer.listen(port, () => {
    console.log(__line__, `Worker ${process.pid} listening on ${port}`);
});

const collection = client.db(config.database).collection("finance");

io.on('connection', function(socket){


    socket.on('events',function(data){
        const query = { "events": {} };
        client.connect(err => {
            const events = collection.find().toArray();


            events.then(doc => {
                //~ console.log(__line__, doc);
                socket.emit('events', doc);
            });
        });
    });

    socket.on('sum', function(data){

        client.connect(async err => {
            const total = await collection.aggregate([{ $group : { _id: null, totals : {  $sum : { $toDouble: "$amount" }}}}]).toArray()
            .then(doc => {
                socket.emit('sum', doc[0].totals);
            });
        });
    });

    socket.on('charts', function(data){
        const date = new Date(data+"-01-01 00:00:00");
        const query = [{ $group : {_id: { title: '$title'}, amount: {$sum: {$toDouble: "$amount"}}}}]//'amount':{"$ne": ['$amount', 0]}, 'start':{ "$gte": [1,{'start': formattedDate(date)}]}}}}];
        console.log(query);
        client.connect(err => {
            try {
                const events = collection.aggregate([ {
                    $match: { $and: [{
                                start: {
                                    $gte: formattedDate(date)
                                }
                            }]
                        }
                    },{
                        $group : {
                            _id: {
                                title: '$title'
                            },
                            amount: {
                                $sum: {
                                    $toDouble: "$amount"
                                }
                            }
                        }
                    }]).sort({ amount: -1 }).limit(200).toArray();

                events.then(doc => {
                    console.log(__line__, doc);
                    socket.emit('charts', doc);
                });
            }
            catch (err){console.log(__line__, err)}
        });
    });

    socket.on('addEvent', function(data){
        client.connect(err => {
            //~ const filteredDocs = collection.findOne();
            //~ filteredDocs.then(function(err,id){
                //~ console.log(__line__, 'Found documents filtered by { a: 3 } =>', id);
                const insertResult = collection.insertOne({title: data.title, start: data.start, amount: data.amount});
                insertResult.then(function(){
                    console.log(__line__, 'Inserted documents =>', insertResult);
                    client.close();
                    socket.emit('addEvent');
                }).catch(function(err){
                    console.log(__line__, 'Error =>', err);
                });
        });
    });
    // perform actions on the collection object
    client.close();
});


function formattedDate(date){                                                               //aud
    if(date > 0){
        //~ logs(__line__,'#################### DATE: \n',date,'\n####################');
        //~ date = date.substring(0,19);
        var tzoffset = (new Date(date)).getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = (new Date(date - tzoffset)).toISOString().slice(0,-1);
        //~ logs(__line__,'#################### DATE: \n',localISOTime.substring(0,19).replace('T', ' '),'\n####################');
        return localISOTime.substring(0,19).replace('T', ' ');
    }
    return null;
}
