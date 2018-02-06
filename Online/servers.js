
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyparser=require('body-parser');
var express=require('express');
var sql=require('mysql');
var fs= require('fs');
var ss=require('socket.io-stream');
app.use(express.static('public'));

var users=[];
var activeUsers=[];
var sockArray=[];
var roomName=[];

/***********************************************************/
function getUsers(){
	var conn=sql.createConnection({
			host:"sql12.freemysqlhosting.net",
			user:"sql12216833",
			password:"LsK8KU9JFP",
			database:"sql12216833"
		});
	conn.connect(function(error){
		if(error) console.log("This is from conn.connect and the issue is"+error);
		conn.query("SELECT * FROM `CALL_DOMAIN_DET`",
		function(err,result){
			if(err) console.log(err);
			for(var i=0;i<result.length;i++){
				let tempname = result[i]["USERNAME"];
				let tempId=result[i]["USERS"];
				let temp={
					userName:tempname,
					userId: tempId
				};
				users.push(temp);
			}				
		});
	});
}


	// SQL code must go here, to fetch the total list of users, and the facilities they are having i.e. restrictions
	
	
	
/*---------------------------------------------------------------------**/


/*********************************************************/

//Required Server side setup
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));

app.get('/',function(req,res){
		res.sendFile(__dirname+"/index.html");
		console.log(__dirname);
	}
);

var content="";
		
fs.readFile(__dirname+"/public/home.html",function(err,data){
					content=data;
});
app.post('/',function(req,res){
		var username=req.body.user;
		console.log("the logged username is "+username+" "+users.length);
		for(var i=0;i<users.length;i++){
			if(username==users[i].userId){
				for(var j=0;j<activeUsers.length;j++){
					if(activeUsers && users==activeUsers[j].id){
						res.end("<h1>We can't support login from multiple places at the same time! Kindly Logout from previous logged device and again login here!</h1><script>setTimeout(redir,4000); function redir(){ window.location.href='index.html';}</script>");
						return;
					}
				}
				var h={
					userName:users[i].userName,
					userId:users[i].userId,
					sockId:"1",
					socks:"1",
					busy:false
				};
				activeUsers.push(h);
				res.writeHead(200,
					{'Content-Type':"text/html"});
				res.write(content+"<script>document.getElementById('hiddenMyId').value='"+username+"';</script>");
				res.end();
				/*	res.write(content+"<script>document.getElementById('hiddenMyId').value='"+username+"';</script>");
				 */break;
			}
		}
	}
);

io.on('connection',function(socket){
	socket.on('disconnect',function(){
		console.log("Inside disconnect, the closing socket id is "+socket.id);
		for(var u=0;u<activeUsers.length;u++){
			console.log("executing for u="+u);
			if(activeUsers[u].sockId==socket.id){
				console.log("User "+activeUsers[u].userId+" is disconnected");
				if(socket.room){
					var a=socket.room;
					socket.broadcast.to(a).emit("lostSignal",{msg:"Hi! "+activeUsers[u].userName+" has disconnected abruptly"});
					var detach=false;
					console.log(io.sockets.adapter.rooms[socket.room].length);
					if(io.sockets.adapter.rooms[socket.room].length==1){
						detach=true;
					}
					socket.broadcast.to(socket.room).emit("disconnectInti",{frmUser:activeUsers[u].userId, detach:detach});
					socket.leave(a);
				}	
				activeUsers.splice(u,1);
				sockArray.splice(u,1);
				console.log("present active User length becomes "+activeUsers.length);
				break;
			}
		}
		io.sockets.emit('broadcast',{usersList:activeUsers});				
	});
	
	
	
	socket.on('userRegister',function(data){
		for(var v=0;v<activeUsers.length;v++){
			if(activeUsers[v].userId==data.Userid){
				activeUsers[v].sockId=socket.id;
				sockArray.push(socket);
				break;
			}
		}
		console.log("The socketId for "+activeUsers[v].userName+" is "+activeUsers[v].sockId);
		socket.emit('done',{allUsers: users});
		io.sockets.emit('broadcast',{usersList:activeUsers});
		socket.broadcast.emit('newclientConnect',{name:data.name, gender:data.gender});
	});
	
	socket.on("sendMsg",function(data){
		var tarId=data.tarIds;
		var tarSocksId=[];
		var myId=data.myId;
		for(var k=0;k<tarId.length;k++){
			for(var p=0;p<activeUsers.length;p++){
				if(activeUsers[p].userId==tarId[k]){
					socket.to(activeUsers[p].sockId).emit("getMsg",{msg:data.msg, grpIds:tarId, msgFrmId:myId});
				}
			}
		}
	});
	
	socket.on("handshaking",function(data){
		var frmUser=data.frmUser;
		var callList=data.callList;
		var mediaType=data.type;
		var roomName=socket.id+Math.random();
		console.log("In handshaking, the room name bfeor joining any room is "+socket.room);
		socket.join(roomName);
		socket.room=roomName;
		console.log("handshaking happening");
		for(var i=0;i<callList.length;i++){
			for(var j=0;j<activeUsers.length;j++){
				if(callList[i]==activeUsers[j].userId){
					if(activeUsers[j].busy){
						console.log("Perosn is busy");
						socket.emit("response", {msg:"The person is busy on another call right now!"});
						var detach=false;
						console.log("detach value is "+detach+" and length of room is "+io.sockets.adapter.rooms[socket.room].length);
						if(io.sockets.adapter.rooms[socket.room].length==1){
							detach=true;
							console.log("Inside detach=true");
							socket.broadcast.to(socket.room).emit("disconnectInti",{frmUser:activeUsers[j].userId, detach:detach});
							var a=socket.room;
							socket.leave(a);
							socket.room=undefined;
						}
						break;
					}
					else{
						var a=sockArray[j];
						activeUsers[j].busy=true;
						a.join(roomName);
						a.room=roomName;
					}
				}
			}
		}
		console.log("hehorh");
		console.log(io.sockets.adapter.rooms[socket.room].length+" is the num of clients");
		if(io.sockets.adapter.rooms[socket.room].length>1){
			console.log("Room name is "+roomName);
			console.log("The media type is "+mediaType);
			socket.broadcast.to(socket.room).emit("pingU",{frmUser:frmUser, medType:mediaType, callList:callList});
		}
		else{
			console.log("None of them has answered to yo");
		}
		/* 
		for(var i=0;i<activeUsers.length;i++){
			if(activeUsers[i].userId==frmUser){
				activeUsers[i].busy=true;
				break;
			}
		}
		for(var i=0;i<callList.length;i++){
			for(var j=0;j<activeUsers.length;j++){
				if(callList[i]==activeUsers[j].userId){
					activeUsers[j].busy=true;
					console.log(mediaType+" call is being triggered by "+activeUsers[j].userName);
					socket.to(activeUsers[j].sockId).emit("pingU",{frmUser:frmUser, callList:callList, medtype:mediaType});
				}
			}
		} */
	});
	
	socket.on("ret",function(data){
		if(socket.room!=null){
			console.log("from the room name: "+socket.room+" with the message :"+data.msg);
		}
	});
	
	socket.on("AnswerCall",function(data){
		if(socket.room!=null){
			var frmUser=data.frmUser;
			var response=data.response;
			socket.broadcast.to(socket.room).emit("shakeResponse",{frmUser:frmUser,resp:response});
			for(var i=0;i<activeUsers.length;i++){
				if(activeUsers[i].userId==frmUser && response!="Ready"){
					var detach=false;
					console.log("detach value is "+detach+" and length of room is "+io.sockets.adapter.rooms[socket.room].length);
					if(io.sockets.adapter.rooms[socket.room].length==2){
						detach=true;
						console.log("Inside detach=true");
						socket.broadcast.to(socket.room).emit("disconnectInti",{frmUser:activeUsers[i].userId, detach:detach});
					}
					activeUsers[i].busy=false;
					var a=socket.room;
					socket.leave(a);
					socket.room=undefined;
					break;
				}
			}
			console.log("Hi the answer was "+data.response+" from "+data.frmUser);
		}
	});
	
	socket.on("videoStream", function(data){
		var toList=data.toIds;
		var frmUser=data.frmUser;
		if(socket.room!=null){
			socket.broadcast.to(socket.room).emit("received-streamV",{frmUser:frmUser, canvaImage:data.canvaImage});
		}
	});
	
	socket.on("audioStream", function(data){
		var toList=data.toIds;
		var frmUser=data.frmUser;
		if(socket.room!=null){
			socket.broadcast.to(socket.room).emit("received-streamA",{frmUser:frmUser, medStream:data.vidStream});
		}
	});
	
	socket.on("endingCall",function(data){
		if(socket.room!=null){
			var detach=false;
			if(io.sockets.adapter.rooms[socket.room].length==2){
				detach=true;
			}
			socket.broadcast.to(socket.room).emit("disconnectInti",{frmUser:data.frmUser, detach:detach});
			var a=socket.room;
			socket.leave(a);
			socket.room=undefined;
		}
	});
			
	/*socket.on('videoConnect', function(data){
		socket.broadcast.emit('incomingVideo',function(){
			ss(socket).on('calling',function(stream,data){
				ss(socket).emit("received-stream",stream);
			});
		});
	});*/
});	


http.listen(3034,function(){
	console.log("Listening on *: 3034");
	getUsers();
});