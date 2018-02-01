const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../')));

app.get("/messages", (req, res, next) => {
  fs.readFile('messages.json', (err, str) => {
    const data = JSON.parse(str);
    res.json(data.messages);
  });
});

app.post("/messages", (req, res, next) => {
  fs.readFile('messages.json', (err, str) => {
    let data = JSON.parse(str);
    data.newMessage.push(req.body);
    fs.writeFile('messages.json', JSON.stringify(data), (err) => {});
    res.json(req.body);
  });
});

app.get("/getNew", (req, res, next) => {
  fs.readFile('messages.json', (err, str) => {
    let data = JSON.parse(str);
    let temp = data.newMessage.map((message) => {
      message.time = Date.now() - message.time;
      return message;
    });

    if(temp.length){
      data.messages = data.messages.concat(temp);
      data.newMessage = [];
      fs.writeFile('messages.json', JSON.stringify(data), (err) => {});
    }

    res.json(data.messages);
  });
});

app.get("*", (req, res, next) => {
  res.sendFile(path.resolve(__dirname, '../', 'client.html'));
});


//=====================WEB SOCKET==============================================
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  console.log("connected");
  ws.on('message', function incoming(message) {
    // const pid = ws._ultron.id; // increments every time the page is refreshed
    // send messages to all web sockets
    let json = JSON.parse(message);
    json.time = Date.now() - json.time;

    broadcast(json);

    // write to file
    fs.readFile('messages.json', (err, str) => {
      let data = JSON.parse(str);
      data.messages.push(json);
      fs.writeFile('messages.json', JSON.stringify(data), (err) => {});
    });
  });

});

function broadcast(json){
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(json));
    }
  });
}


// =======================START SERVER==============================================
const port = process.env.PORT || 8080;

server.listen(port, function(){
  const pid = process.pid;
  console.log("Server process connected...\npid: " + pid + "\nExpress server is listening on port: " + port);
});
