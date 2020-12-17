var websocketGame = {
 // indicates if it is drawing now.
 isDrawing : false,
 isTurnToDraw : false,
 // the starting point of next line drawing.
 startX : 0,
 startY : 0,
//Contants
 LINE_SEGMENT : 0,
 CHAT_MESSAGE : 1,
 GAME_LOGIC : 2,
 //Constant for game logic state
 WAITING_TO_START : 0,
 GAME_START : 1,
 GAME_OVER : 2,
 GAME_RESTART : 3,
}
//Color palette
var color;
function changeColors(palette) {
	switch(palette.id) {
		case "red":
			color = "red";
			break;
		case "red1":
			color = "#F16161";
			break;
		case "red2":
			color = "#F69FA0";
			break;
		case "orange":
			color = "orange";
			break;
		case "orange1":
			color = "#F99F62";
			break;
		case "orange2":
			color = "#FBB57B";
			break;
		case "blue":
			color = "#09C2DB";
			break;
		case "blue1":
			color = "#8BD3DC";
			break;
		case "blue2":
			color = "#B9E3E8";
			break;
		case "indigo":
			color = "#0E38AD";
			break;
		case "indigo1":
			color = "#546AB2";
			break;
		case "indigo2":
			color = "#9C96C9";
			break;
		case "green":
			color = "green";
			break;
		case "green1":
			color = "#97CD7E";
			break;
		case "green2":
			color = "#C6E2BB";
			break;
		case "black":
			color = "black";
			break;
		case "black1":
			color = "#545454";
			break;
		case "black2":
			color = "#B2B2B2";
			break;
		case "yellow":
			color = "yellow";
			break;
		case "yellow1":
			color = "#F7F754";
			break;
		case "yellow2":
			color ="#F7F4B1";
			break;
		case "purple":
			color = "#B9509E";
			break;
		case "purple1":
			color = "#D178B1";
			break;
		case "purple2":
			color = "#E3ABCE";
			break;
		case "erase":
			color = "white";
			break;
	}
};
//Clear canvas
function erase() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};
//Change line width
function lineWidthRange() {
    var widthLine = document.getElementById("myRange").value;
    return widthLine;
};
//canvas context
var canvas = document.getElementById('drawing-pad');
var ctx = canvas.getContext('2d');
// init script when the DOM is ready.
$(function(){
 // check if existence of WebSockets in browser
 if (window["WebSocket"]) {

 // create connection
 websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

 // on open event
 websocketGame.socket.onopen = function(e) {
 console.log('WebSocket connection established.');
 };

 // on close event
 websocketGame.socket.onclose = function(e) {
 console.log('WebSocket connection closed.');
 };
 
 //on message event
 websocketGame.socket.onmessage = function(e) {
	 // check if the received data is chat or line segment
	 console.log("onmessage event:",e.data);
	 var data = JSON.parse(e.data);
	 if (data.dataType == websocketGame.CHAT_MESSAGE) {
		 $("#chat-history").append("<li>" + data.sender
				 + " said: "+data.message+"</li>");
	 }
	 else if (data.dataType == websocketGame.LINE_SEGMENT) {
		 drawLine(ctx, data.startX, data.startY,
		 data.endX, data.endY, data.lineWidth, data.color);
	 }
	 else if (data.dataType == websocketGame.GAME_LOGIC) {
		 if (data.gameState == websocketGame.GAME_OVER) {
		 websocketGame.isTurnToDraw = false;
		 $("#chat-history").append("<li>" + data.winner
		 +" wins! The answer is '"+data.answer+"'.</li>");
		 $("#restart").show();
		 }
		 if (data.gameState == websocketGame.GAME_START) {
		 // clear the Canvas.
		 canvas.width = canvas.width;

		 // hide the restart button.
		 $("#restart").show();

		 // clear the chat history
		 $("#chat-history").html("");

		 if (data.isPlayerTurn) {
		 websocketGame.isTurnToDraw = true;
		 $("#chat-history").append("<li>Your turn to draw. Please draw " + data.answer + ".</li>");
		 }
		 else {
		 $("#chat-history").append("<li>Game Started. Get Ready. You have one minute 30 seconds to guess.</li>");
		 }
		 }
	}

};
 //jquery events
 $("#send").click(sendMessage);

 $("#chat-input").keypress(function(event) {
  if (event.keyCode === 13) {
  sendMessage();
  }
 });
//restart button
 $("#restart").hide();
 $("#restart").click(function(){
  canvas.width = canvas.width;
  $("#chat-history").html("");
  $("#chat-history").append("<li>Restarting Game.</li>");

  // pack the restart message into an object.
  var data = {};
  data.dataType = websocketGame.GAME_LOGIC;
  data.gameState = websocketGame.GAME_RESTART;
  websocketGame.socket.send(JSON.stringify(data));

  $("#restart").hide();
 });
 function sendMessage() {
	 var message = $("#chat-input").val();

	 // pack the message into an object.
	 var data = {};
	 data.dataType = websocketGame.CHAT_MESSAGE;
	 data.message = message;

	 websocketGame.socket.send(JSON.stringify(data));
	 $("#chat-input").val("");
 }
//the logic of drawing in the Canvas
 $("#drawing-pad").mousedown(function(e) {
  // get the mouse x and y relative to the canvas top-left point.
  var mouseX = e.originalEvent.layerX || e.offsetX || 0;
  var mouseY = e.originalEvent.layerY || e.offsetY || 0;
  websocketGame.startX = mouseX;
  websocketGame.startY = mouseY;
  websocketGame.isDrawing = true;
 });
 $("#drawing-pad").mousemove(function(e) {
  // draw lines when is drawing
  if (websocketGame.isDrawing) {
  // get the mouse x and y
  // relative to the canvas top-left point.
  var mouseX = e.originalEvent.layerX || e.offsetX || 0;
  var mouseY = e.originalEvent.layerY || e.offsetY || 0;
  if (!(mouseX === websocketGame.startX &&
  mouseY === websocketGame.startY)) {
  drawLine(ctx, websocketGame.startX,
  websocketGame.startY,mouseX,mouseY,lineWidthRange(), changeColors(color));
 //send the line segment to server
  var data = {};
  data.dataType = websocketGame.LINE_SEGMENT;
  data.startX = websocketGame.startX;
  data.startY = websocketGame.startY;
  data.endX = mouseX;
  data.endY = mouseY;
  data.color = color;
  data.lineWidth = lineWidthRange();
  websocketGame.socket.send(JSON.stringify(data));
  websocketGame.startX = mouseX;
  websocketGame.startY = mouseY;
  }
  }
 });
 $("#drawing-pad").mouseup(function(e) {
  websocketGame.isDrawing = false;
 });
 function drawLine(ctx, x1, y1, x2, y2, thickness, color) {
	 ctx.beginPath();
	 ctx.moveTo(x1,y1);
	 ctx.lineTo(x2,y2);
	 ctx.lineWidth = thickness;
	 ctx.strokeStyle = color;
	 ctx.stroke();
 }
 }
});