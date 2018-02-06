var socket=io();
var usersList=[];
var actList=[];
var uCount=0;
var waitCount=0;
var chatWindowTrack=[];
var userNameUserId=[];
var userlist=[];
var waitlist=[];
var listSelected=[];
var constraints="";
var videoPlayFlag=false;
var actualRatio=0;
var originalHeight=0;
var originalWidth=0;
var tarRatio=1;
var numToWords=[];
numToWords[1]="One";
numToWords[2]="Two";
numToWords[3]="Three";
numToWords[4]="Four";
var mediaTypes=[];
mediaTypes["vid"]="video";
mediaTypes["aud"]="audio";
mediaTypes["txt"]="text";
var elementClicked;
var divActive="";
var streamSource;
var colors=["blue","red","orange","green"];
var resolveCallNum=[];
resolveCallNum[1]="onetoOne";
resolveCallNum[2]="onetoTwo";
resolveCallNum[3]="onetoThree";
resolveCallNum[4]="onetoFour";
var shakeAlert=false;
var pickCall=false;
var callTrackWindow=[];
var imageTrackWindow=[];
var endFlag=false;
window.onload=function(){
	socket.emit('userRegister',{Userid:document.getElementById("hiddenMyId").value});
};


socket.on('done',function(data){
	usersList=data.allUsers;
	var listHolder=document.getElementById("Userslist");
	listHolder.innerHTML="<ul>";
	for(var i=0;i<usersList.length;i++){
		if(usersList[i].userId==document.getElementById("hiddenMyId").value)continue;
		listHolder.innerHTML+="<li><a href='javascript:void(0)' class='usersListAnchors' id='"+usersList[i].userId+"'>"+usersList[i].userName+"</a><img src='Media/emoji.jpg' alt='uicon' class='uimg'></li>";
	}
	listHolder.innerHTML+="</ul>";
	document.querySelectorAll("#Userslist a").forEach(
		function(elem){
			igniteLink(elem);
		}
	);

});

function igniteLink(obj){
	obj.addEventListener("click",
		function(){
			console.log("It has come here with obj.id as "+obj.id+" ");
			userDet(obj);
		}
	);
}

socket.on('broadcast',function(data){
	actList=data.usersList;
	for(var i=0;i<usersList.length;i++){
		if(usersList[i].userId==document.getElementById("hiddenMyId").value)continue;
		var h=document.getElementById(""+usersList[i].userId).parentNode;
		h.style.listStyleType="none";
		h.style.width="100%";
		h.style.position="relative";
		h.style.left="0%";
		document.getElementById(""+usersList[i].userId).style.color="blue";
		document.getElementById(""+usersList[i].userId).name="OFF";
	}
	for(var i=0;i<actList.length;i++){
		if(actList[i].userId==document.getElementById("hiddenMyId").value)continue;
		var h=document.getElementById(""+actList[i].userId).parentNode;
		h.style.listStyleType="disc";
		h.style.color="green";
		h.style.width-="20%";
		h.style.position="relative";
		h.style.left="10%";
		document.getElementById(""+actList[i].userId).style.color="blue";
		document.getElementById(""+actList[i].userId).name="ON";
	}
});

socket.on('getMsg',function(data){
	handleReceiveMsg(data);
});

function sendingMsg(trgtIds,txtValue){
	console.log("Triggering sendingMsg with trgtIds being "+trgtIds);
	socket.emit('sendMsg',{myId:document.getElementById("hiddenMyId").value, tarIds:trgtIds,msg:txtValue});
}

function handleReceiveMsg(data){
	if(data.grpIds.length>1){
		//Its a group msg
	}
	else{
		//its a one to one msg
		for(var z=0;z<usersList.length;z++){
			if(usersList[z].userId==data.msgFrmId){
				var h={id:data.msgFrmId, name:usersList[z].userName, msg:data.msg};
				recPopDet(h);
			}
		}
	}
}

function scrollUpdate(num){
	var elem=document.getElementById("PreMsgs"+num);
	elem.scrollTop=elem.scrollHeight;
}

function recPopDet(obj){
	var z=false;
	for(var t=0;t<userlist.length;t++){
		if(userlist[t]==obj.name){
			z=true;
			break;
		}
	}
	if(z){
		//Continue in that same dialog Box
		var h=chatWindowTrack[""+obj.id];
		document.getElementById("PreMsgs"+h).innerHTML+="<br><div class='recMsgs'><div>"+obj.msg+"</div></div>";
		scrollUpdate(h);
	}
    else{
		if(uCount<4){
			userlist.push(obj.name);
			document.querySelectorAll(".ChatBox")[uCount].style.visibility="visible";
			uCount++;
			document.querySelectorAll("#ChatBox"+uCount+ " h5")[0].innerHTML=obj.name;
			document.getElementById("tBox"+uCount).value="";
			document.getElementById("tBox"+uCount).focus();
			userNameUserId[""+obj.name]=obj.id;
			chatWindowTrack[""+obj.id]=uCount;
			var h=chatWindowTrack[""+obj.id];
			document.getElementById("PreMsgs"+h).innerHTML+="<br><div class='recMsgs'><div>"+obj.msg+"</div></div>";
			scrollUpdate(h);
		}
	}		
}
function userDet(obj){
	if(uCount<4){
		for(var j=0;j<userlist.length;j++){
			if(obj.innerHTML==userlist[j]){
				alert("Hey, the user has been already selected");
				return;
			}
		}
		userlist.push(obj.innerHTML);
		document.querySelectorAll(".ChatBox")[uCount].style.visibility="visible";
		uCount++;
		document.querySelectorAll("#ChatBox"+uCount+ " h5")[0].innerHTML=obj.innerHTML;
		document.getElementById("tBox"+uCount).value="";
		document.getElementById("tBox"+uCount).focus();
		userNameUserId[""+obj.innerHTML]=obj.id;
		chatWindowTrack[""+obj.id]=uCount;
	}
}

function closeThis(num){
	if(document.getElementById("tBox"+num).value!=""){
		if(!confirm("There is a message that has not been sent! Pressing Ok will close this Chat Box without sending")){
			return;
		}
	}
	var z=document.getElementById("ChatBox"+num);
	var headerset=document.querySelectorAll("#ChatBox"+num+ " h5")[0];
	var tmpList=userlist;
	userlist=[];
	for(var jl=0;jl<tmpList.length;jl++){
		if(tmpList[jl]==headerset.innerHTML){
			continue;
		}
		userlist.push(tmpList[jl]);
	}
	if(num<uCount){
		for(jl=num;jl<uCount;jl++){
			var ab=jl+1;
			document.getElementById("PreMsgs"+jl).innerHTML=document.getElementById("PreMsgs"+ab).innerHTML;
			document.getElementById("tBox"+jl).value=document.getElementById("tBox"+ab).value;
			document.querySelectorAll("#ChatHeader"+jl+" h5")[0].innerHTML=document.querySelectorAll("#ChatHeader"+ab+" h5")[0].innerHTML;
		}
	}
	document.getElementById("PreMsgs"+uCount).innerHTML="";
	document.getElementById("tBox"+uCount).value="";
	document.querySelectorAll(".ChatBox")[uCount-1].style.visibility="hidden";
	uCount=userlist.length;
}
/*****************************************************------------------***********************************/
//This is to enable send text message when enter or escape key is pressed
document.querySelectorAll("textarea").forEach(function(elem){
	elem.addEventListener("keyup",function(keyEvt){
		var key=keyEvt.code;
			if(key=="Enter"){
				var h=parseInt(elem.id.split("")[4]);
				var id=[];
				id[0]=userNameUserId[document.querySelectorAll("#ChatBox"+h+ " h5")[0].innerHTML];
				document.getElementById("PreMsgs"+h).innerHTML+="<br><div class='MyMsgs'><div>"+elem.value+"</div></div>";
				sendingMsg(id,elem.value);
				scrollUpdate(h);
				elem.value="";
			//Call Send Message
		}
		if(key=="Escape"){
			var h=parseInt(elem.id.split("")[4]);
			closeThis(h);
			document.getElementById("tBox"+h).focus();
		}
		
	});
});

document.querySelectorAll(".CallButtons").forEach(
	function(elem){
		elem.addEventListener("click",
			function(){
				elementClicked=elem.id;
				document.getElementById("MediaSpace").style.display="block";
			}
		);
	}
);

document.getElementById("Close").addEventListener("click",
	function(){
		document.getElementById("MediaSpace").style.display="none";
		document.getElementsByClassName("AskNumOfCallee")[0].style.display="block";
		document.getElementsByClassName("PickCallee")[0].style.display="none";
		listSelected=[];
	}
);

document.getElementById("calleeQuan").addEventListener("change",
	function(){
		if(document.getElementById("calleeQuan").value>0){
			document.getElementsByClassName("AskNumOfCallee")[0].style.display="none";
			buildUserlist();
			document.getElementsByClassName("PickCallee")[0].style.display="block";
			document.getElementById("callNum").innerHTML=numToWords[document.getElementById("calleeQuan").value];
			enableCallButton();
		}
	}
);

function buildUserlist(){
	var tailorText=document.getElementById("ulistNames");
	tailorText.innerHTML="<ul>";
	document.querySelectorAll("#Userslist a").forEach(
		function(ele){
			if(ele.name=="ON"){
				tailorText.innerHTML+="<li id='Li"+ele.id+"'>"+ele.innerHTML+"<img src='Media/emoji.jpg' alt='icon' class='udispimg'><input type='checkbox' id='Chk"+ele.id+"'></li>";
			}
		}
	);
	tailorText.innerHTML+="</ul>";
}


function enableCallButton(){
	document.getElementById("CallThem").addEventListener("click",
		function(){
			document.querySelectorAll("#ulistNames li").forEach(
				function(elem){
					var chkId="Chk"+elem.id.substring(2);
					if(document.getElementById(chkId).checked){
						listSelected.push(elem.id.substring(2));
					}
				}
			);
			if(listSelected.length!=parseInt(document.getElementById("calleeQuan").value)){
				alert("Please select the correct number of people!");
				document.querySelectorAll("#ulistNames li").forEach(
					function(elem){
						var chkId="Chk"+elem.id.substring(2);
						document.getElementById(chkId).checked=false;
					}
				);
				listSelected=[];
			}
			else{
				document.getElementsByClassName("PickCallee")[0].style.display="none";
				divActive=resolveCallNum[listSelected.length];
				document.getElementById(""+divActive).style.display="block";
				for(var th=0;th<listSelected.length;th++){
					callTrackWindow[""+listSelected[th]]=document.querySelectorAll("#" +divActive+" audio")[th];
					imageTrackWindow[""+listSelected[th]]=document.querySelectorAll("#"+divActive+" img")[th];
				}
				connectCall(listSelected.length);
				callTrigger();
				
			}
		}
	);
}
function connectCall(num){
	switch(num){
		case 1: divActive="onetoOne";break;
		case 2: divActive="onetoTwo";break;
		case 3: divActive="onetoThree";break;
		case 4: divActive="oneToFour";break;
	}
	var i=1;
	originalHeight=360/num;
	originalWidth=640/num;
	document.getElementById("Close").style.display="none";
	var bottomMedia=document.createElement(""+elementClicked);
	var bottomDiv=document.getElementById("selfFacingContainer");
	bottomMedia.setAttribute("height","100%");
	bottomMedia.setAttribute("width","100%");
	bottomDiv.appendChild(bottomMedia);
	bottomDiv.style.display="block";
	checkCallToGo();
	//document.getElementById("masterEnd").disabled=false;
}

function checkCallToGo(){
	var param=0;
	if(elementClicked=="video")param=1;
	if(elementClicked=="audio")param=2;
	//if(elementClicked=="text")//doNothing	
	activateCall(param);
}

//This function sets the constraints for the getUserMedia parameter

function activateCall(callType){
	if(callType==1){
		//Code To Be Added
		constraints={audio:true, video:true};
	}
	else{
		constraints={audio:true, video:false};
	}
	localMediaActivate();
}

//This is the main part where it activates the local Media for it to help stream
//The local stream is stored in a variable and assigned to global variable so that the peer connections can have local stream be assigned
//From that variable
function localMediaActivate(){
	if(navigator.mediaDevices === undefined){
		navigator.mediaDevices={};
	}

	//For browsers that implement partially the mediaDevices
	if (navigator.mediaDevices.getUserMedia === undefined) {
		navigator.mediaDevices.getUserMedia = function(constraints) {

			// First get a hold of the legacy getUserMedia, if present
			var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			// Some browsers just don't implement it - return a rejected promise with an error
			// to keep a consistent interface
			if (!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}
			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
			return new Promise(function(resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		}
	}

	navigator.mediaDevices.getUserMedia(constraints)
	.then(function(localStream){
			var genericMediaElem=document.querySelectorAll("#selfFacingContainer "+elementClicked)[0];
			genericMediaElem.srcObject=localStream;
			genericMediaElem.onloadedmetadata=function(e){
				genericMediaElem.play();
				streamSource=localStream;
				localMediaFlag=true;
				genericMediaElem.muted=true;
				makeUpStreamReady();
			};
		})
	.catch(function(err) {/*doNothing*/ });
}

var medRecord;
var canvas;
var vidElem;
var ctx;
var canvaDataURL=null;
var chunks=[];
var jik=0;	
function makeUpStreamReady(){
	medRecord=new MediaRecorder(streamSource);
	canvas=document.getElementById("myself");
	ctx=canvas.getContext("2d");
	vidElem=document.querySelectorAll("#selfFacingContainer "+elementClicked)[0];
	//visualize(streamSource);
	chunks=[];
	videoPlayFlag=true;
	if(elementClicked=="video"){
		drawPics();
		function drawPics(){
			ctx.drawImage(vidElem,0,0,canvas.width,canvas.height);
			canvaDataURL=canvas.toDataURL('image/jpeg',1.0);
			socket.emit("videoStream",{canvaImage:canvaDataURL, frmUser:document.getElementById("hiddenMyId").value, dumb:jik});
			setTimeout(function(){
				if(endFlag)return;
				drawPics();
			},40);
		}
	}
	recordProceed();
	function recordProceed(){
		medRecord.start();
		setTimeout(function(){
			if(endFlag)return;
			recordHalt();
		},80);		
	}
	function recordHalt(){
		medRecord.stop();
		recordProceed();
	}
	medRecord.onstop=function(){
			socket.emit("audioStream",{vidStream:chunks,frmUser:document.getElementById("hiddenMyId").value});
			chunks=[];
	}
	medRecord.ondataavailable=function(e){ chunks.push(e.data);}
}




function callTrigger(){
	socket.emit("handshaking",{frmUser:document.getElementById("hiddenMyId").value, callList:listSelected, type:elementClicked});
	shakeAlert=true;
}

socket.on("response",function(data){
	alert(data.msg);
});
socket.on("pingU",function(data){
			elementClicked=data.medType;
			document.getElementById("MediaSpace").style.display="block";
			document.getElementsByClassName("AskNumOfCallee")[0].style.display="none";
			document.getElementById("incomingCall").style.display="block";
			document.getElementById("incomingCall").innerHTML="<div>Hi You are having "+data.callList.length>1?"group":"onetoOne" +" "+data.medType+" call";
			document.getElementById("incomingCall").innerHTML+="<br><button id='Y' value='Yes'>Answer</button><button id='N' value='No'>Reject</button></div>";
			for(var i=0;i<data.callList.length;i++){
				if(data.callList[i]==document.getElementById("hiddenMyId").value){
					data.callList.splice(i,1);
				}
			}
			data.callList.push(data.frmUser);
			document.getElementById("Y").addEventListener("click",function(){
				divActive=resolveCallNum[data.callList.length];
				document.getElementById("incomingCall").style.display="none";
				document.getElementById(""+divActive).style.display="block";
				for(var th=0;th<data.callList.length;th++){
					callTrackWindow[data.callList[th]]=document.querySelectorAll("#" +divActive+" audio")[th];
					imageTrackWindow[data.callList[th]]=document.querySelectorAll("#"+divActive+" img")[th];
				}
				connectCall(data.callList.length);
				socket.emit("AnswerCall",{response:"Ready", frmUser:document.getElementById("hiddenMyId").value});				
				shakeAlert=true;
				pickCall=true;
			});
			document.getElementById("N").addEventListener("click",function(){
				socket.emit("AnswerCall",{response:"Nope", frmUser:document.getElementById("hiddenMyId").value});
				document.getElementById("incomingCall").style.display="none";
				document.getElementsByClassName("AskNumOfCallee")[0].style.display="block";
				document.getElementById("MediaSpace").style.display="none";
				shakeAlert=false;
				pickCall=true;
				elementClicked="";
			});
			checkIfAnswering();
	}
);
var timer1=0;
function checkIfAnswering(){
	if(pickCall){
		timer1=0;
		return;
	}
	else{
		if(timer1==30){
			document.getElementById("incomingCall").style.display="none";
			document.getElementsByClassName("AskNumOfCallee")[0].style.display="block";
			document.getElementById("MediaSpace").style.display="none";
			shakeAlert=false;	
			timer1=0;
			socket.emit("AnswerCall",{response:"No Answer", frmUser:document.getElementById("hiddenMyId").value});	
			elementClicked="";
		}
		else{
			timer1++;
			setTimeout(function(){
			checkIfAnswering()},1000);
		}
	}
}

socket.on("shakeResponse",function(data){
	if(shakeAlert){
		if(data.resp=="Ready"){
			/* listSelected.push(data.frmUser);
			streamMedia(listSelected); */
			//Do nothing
		}
		else{
			for(var j=0;j<usersList.length;j++){
				if(usersList[j].userId==data.frmUser && data.resp=="Nope"){
					alert(usersList[j].userName+" has rejected the call");
					break;
				}
				else if(usersList[j].userId==data.frmUser && data.resp=="No Answer"){
						alert(usersList[j].userName+" has not answered the call");
						break;
				}
			}
		}
	}
});

socket.on("lostSignal", function(data){
	alert(data.msg);
});
socket.on("received-streamV",function(data){
	imageTrackWindow[data.frmUser].src=data.canvaImage;		
	console.log("Getting video");
});	

socket.on("received-streamA",function(data){
	var blob=new Blob(data.medStream, {'type':'audio/ogg;'});
	var audioURL=URL.createObjectURL(blob);
	callTrackWindow[data.frmUser].src=audioURL;			
	console.log("Getting audio");
});	

document.querySelectorAll(".end").forEach(function(elem){
	elem.addEventListener("click",
		function(){
			endSession();
		});
});
function endSession(){
	document.getElementById("incomingCall").style.display="none";
	document.getElementsByClassName("AskNumOfCallee")[0].style.display="block";
	document.getElementById("Close").style.display="inline";
	document.getElementById("MediaSpace").style.display="none";
	var mediaElem=document.querySelectorAll("#selfFacingContainer "+elementClicked)[0];
	mediaElem.srcObject.getTracks().forEach(track => track.stop());
	mediaElem.srcObject=null;
	endFlag=true;
	var bottomDiv=document.getElementById("selfFacingContainer");
	var bottomMedia=document.querySelectorAll("#selfFacingContainer "+elementClicked)[0];
	bottomDiv.removeChild(bottomMedia);
	bottomDiv.style.display="none";
	document.getElementById(""+divActive).style.display="none";
	chatWindowTrack=[];
	imageTrackWindow=[];
	elementClicked="";
	listSelected=[];
	medRecord="";
	canvas="";
	vidElem="";
	ctx="";
	canvaDataURL="";
	chunks=[];
	divActive="";
	streamSource="";
	shakeAlert=false;
	pickCall=false;
	endFlag=false;
	videoPlayFlag=false;
	socket.emit("endingCall", {frmUser:document.getElementById("hiddenMyId").value});
}
window.onbeforeunload=function(){
	endSession();
}
socket.on("disconnectInti",function(data){
	var contactname="";
	for(var i=0;i<actList.length;i++){
		if(actList[i].userId==data.frmUser){
			contactname=actList[i].userName;
			break;
		}
	}
	callTrackWindow[data.frmUser].src=null;
	imageTrackWindow[data.frmUser].src=data.canvaImage;		
	alert(contactname+" has disconnected");
	if(data.detach)endSession();
});