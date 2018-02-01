// this script tag allows for the two-way communication bewteen server and client
// this just allows for instant page refresh when files change in development
// $(function(){
let socket;

function socketMessage(){
  const input = $("#myInput").val();
  $("#myInput").val('');

  socket.send(JSON.stringify({
    message: input,
    user: 'sarah',
    time: Date.now(),
    socket: true
  }));
}

function ajaxMessage(){
  const input = $("#myInput").val();

  $.ajax({
    type: "POST",
    url: "/messages/",
    dataType: "json",
    data: JSON.stringify({
      message: input,
      user: 'sarah',
      time: Date.now(),
      socket: false
    }),
    contentType: "application/json",
    success: function(){
      $("#myInput").val('');
      // startAjax();
    }
   });
}

function startSocket(){
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // if browser doesn't support WebSocket, just show
  // some notification and exit
  if (!window.WebSocket) {
    console.log('Sorry, but your browser doesn\'t support WebSocket.');
    return;
  }

  // open connection
  // Create WebSocket connection.
  socket = new WebSocket(window.location.href.replace('http', 'ws'));

  // Connection opened
  socket.addEventListener('open', function (event) {
    // socket.send('Web socket connected...');
  });

  // Listen for messages
  socket.addEventListener('message', function (event) {
    console.log('Message from server: ', event);
    const data = JSON.parse(event.data);
    $("#messageContainer").append(`
      <div class=${(message.socket) ? "blue message" : "message"}>
        ${data.message}
        <small>${data.time} ms</small>
      </div>`)
  });
}

function startAjax(){
  $.get( "/getNew", function(json) {
    console.log(json);
    if(json){
      const html = json.reduce((str, data) => {
        const message = (typeof data === "object") ? data: JSON.parse(data);
        return str + `
          <div class=${(message.socket) ? "blue message" : "message"}>
            ${message.message}
            <small>${message.time} ms</small>
          </div>`;
      }, '');

      $("#messageContainer").empty();
      $("#messageContainer").append(html);
    }
  });
}

function start(){
  // if user is running mozilla then use it's built-in WebSocket
  $.get("/messages", (json) => {
    const html = json.reduce((str, data) => {
      const message = (typeof data === "object") ? data: JSON.parse(data);
      return str + `
        <div class=${(message.socket) ? "message blue" : "message"}>
          ${message.message}
        </div>`;
    }, '');

    $("#messageContainer").append(html);
  });

  startSocket();
  setInterval(startAjax, 50);
}

start();
