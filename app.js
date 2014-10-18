var fs = require('fs');
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var express = require('express');
var app = express();
var redis = require('redis');
var redisClient = redis.createClient();

app.get('/connect', function(request, response) {
  console.log("Got a request at /connect");
  redisClient.get("secret", function(err, reply){
    if(reply===null){
      console.log("Creating secret");
      var secret = Math.random().toString(36).slice(2);
      redisClient.set("secret", secret);
      response.send("Your key is " + secret);
    } else {
      response.send("A key has already been generated");
    }
  });
});

app.get('/server/minecraft/:command', function(request, response) {
  var command;
  console.log("Got the command: " + request.params.command);
  command = 'service minecraft ' + request.params.command;
  child = exec(command, function(error, stdout, stderr){
    if (error != null) {
      console.log('exec error: ' + error);
    };
    response.set('Content-Type', 'text/html');
    response.write('command: ' + command + "<br/>");
    response.write('stdout: ' + stdout + "<br/>");
    response.write('stderr: ' + stderr + "<br/>");
    response.end();
  });
});

app.get('/', function (request, response) {
  redisClient.get('secret', function (err, reply) {
    if (reply === request.get('secret')) {
      response.send('Welcome, user!\n');
    } else{
      response.send('You are not authorized here\n');
    };
  });
});

app.listen(8080);