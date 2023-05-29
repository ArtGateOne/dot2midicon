//dot2midicon2 v 1.2 by ArtGateOne
/* INFO
encoders
1 - pan
2 - pan fine
3 - tilt
4 - tilt fine

rotary
Red / Green / Blue / White / Gobo1 / Gobo2 / Focus / Zoom
*/



//config
var midi_in = 'MIDIcon 2';     //set correct midi in device name
var wing = 1;	// select bwing/fwing 1 or 2



var encodervalue = 2;	//PAN/TILT speed
var encodervalue2 = 0.2;	//PAN/TILT FINE speed

var sessionnr = 0;
var request = 0;
var interval_on = 0;
var faderValue = 0;
var grandmastervalue = 100;
var blackout = false;
if (wing == 1) {//matrix buttons
	var matrixbuttons = [0, 307, 306, 305, 304, 303, 302, 301, 300, 407, 406, 405, 404, 403, 402, 401, 400, 507, 506, 505, 504, 503, 502, 501, 500, 607, 606, 605, 604, 603, 602, 601, 600, 707, 706, 705, 704, 703, 702, 701, 700, 807, 806, 805, 804, 803, 802, 801, 800];
	var fader = [0, 13, 12, 11, 10, 9, 8, 7, 6];
	var playbackbuttons = [113, 112, 111, 110, 109, 108, 107, 106, 213, 212, 211, 210, 209, 208, 207, 206];
} else if (wing == 2) {
	var matrixbuttons = [0, 315, 314, 313, 312, 311, 310, 309, 308, 415, 414, 413, 412, 411, 410, 409, 408, 515, 514, 513, 512, 511, 510, 509, 508, 615, 614, 613, 612, 611, 610, 609, 608, 715, 714, 713, 712, 711, 710, 709, 708];
	var fader = [0, 21, 20, 19, 18, 17, 16, 15, 14];
	var playbackbuttons = [121, 120, 119, 118, 117, 116, 115, 114, 221, 220, 219, 218, 217, 216, 215, 214];
}


function interval() {
	client.send('{"requestType":"getdata","data":"set","session":' + sessionnr + ',"maxRequests":1}');
};

//EASYMIDI-------------------
var easymidi = require('easymidi');

console.log('MIDI inputs:');
console.log(easymidi.getInputs());

console.log('MIDI outputs:');
console.log(easymidi.getOutputs());


var input = new easymidi.Input(midi_in);



input.on('cc', function (msg) {//1-8 fader

	if (msg.controller <= 8) {
		if (msg.value <= 2) {
			faderValue = 0;
		} else {
			faderValue = (((msg.value) - 2) * 0.008);
		}
		client.send('{"requestType":"playbacks_userInput","execIndex":' + fader[msg.controller] + ',"pageIndex":' + msg.channel + ',"faderValue":' + (faderValue) + ',"type":1,"session":' + sessionnr + ',"maxRequests":0}');
	}

	if (msg.controller === 9) {//Grand Master
		if (msg.value <= 2) {
			faderValue = 0;
		} else {
			faderValue = ((msg.value) - 2);
			faderValue = (faderValue * 0.8);
		}
		grandmastervalue = faderValue;
		if (blackout == false) {
			client.send('{"command":"SpecialMaster 2.1 At ' + (faderValue) + '","session":' + sessionnr + ',"requestType":"command","maxRequests":0}');
		}
	}
});



input.on('noteon', function (msg) {

	//1-32 matrix buttons
	if (msg.note <= 32) {
		if (msg.velocity == 127) {
			client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + matrixbuttons[msg.note] + ',"pageIndex":' + msg.channel + ',"buttonId":0,"pressed":true,"released":false,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
		} else {
			client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + matrixbuttons[msg.note] + ',"pageIndex":' + msg.channel + ',"buttonId":0,"pressed":false,"released":true,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
		}
	}


	//33-40 ABCDEFGH Buttons 



	//41-56 Playback buttons
	if (msg.note >= 41 && msg.note <= 56) {
		if (msg.velocity == 127) {
			client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + playbackbuttons[msg.note - 41] + ',"pageIndex":' + msg.channel + ',"buttonId":0,"pressed":true,"released":false,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
		} else {
			client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + playbackbuttons[msg.note - 41] + ',"pageIndex":' + msg.channel + ',"buttonId":0,"pressed":false,"released":true,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
		}
	}


	//59-64 Shortcut buttons



	//67 Balackout led
	if (msg.note == 67) {//blackout led 114 ? 123? ??????
		if (msg.velocity === 127) {
			blackout = true;
			client.send('{"command":"SpecialMaster 2.1 At ' + 0 + '","session":' + sessionnr + ',"requestType":"command","maxRequests":0}');
		} else {
			blackout = false;
			client.send('{"command":"SpecialMaster 2.1 At ' + (grandmastervalue) + '","session":' + sessionnr + ',"requestType":"command","maxRequests":0}');
		}
	}

	//68-75 Rotary push in

	//78-85 Encoders
	if (msg.note == 78) {//Encoder 1 +
		client.send('{"requestType":"encoder","name":"PAN","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 79) {//Encoder 1 -
		client.send('{"requestType":"encoder","name":"PAN","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 80) {//Encoder 2 +
		client.send('{"requestType":"encoder","name":"PAN","value":' + encodervalue2 + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 81) {//Encoder 2 -
		client.send('{"requestType":"encoder","name":"PAN","value":' + -1 * encodervalue2 + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 82) {//Encoder 3 +
		client.send('{"requestType":"encoder","name":"TILT","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 83) {//Encoder 3 -
		client.send('{"requestType":"encoder","name":"TILT","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 84) {//Encoder 4 +
		client.send('{"requestType":"encoder","name":"TILT","value":' + encodervalue2 + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 85) {//Encoder 4 -
		client.send('{"requestType":"encoder","name":"TILT","value":' + -1 * encodervalue2 + ',"session":' + sessionnr + ',"maxRequests":0}');
	}


	//86-101 Playback rotaries
	if (msg.note == 86) {//Rotary 1 +
		client.send('{"requestType":"encoder","name":"COLORRGB1","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 87) {//Rotary 1 -
		client.send('{"requestType":"encoder","name":"COLORRGB1","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 88) {//Rotary 2 +
		client.send('{"requestType":"encoder","name":"COLORRGB2","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 89) {//Rotary 2 -
		client.send('{"requestType":"encoder","name":"COLORRGB2","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 90) {//Rotary 3 +
		client.send('{"requestType":"encoder","name":"COLORRGB3","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 91) {//Rotary 3 -
		client.send('{"requestType":"encoder","name":"COLORRGB3","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 92) {//Rotary 4 +
		client.send('{"requestType":"encoder","name":"COLORRGB5","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 93) {//Rotary 4 -
		client.send('{"requestType":"encoder","name":"COLORRGB5","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 94) {//Rotary 5 +
		client.send('{"requestType":"encoder","name":"GOBO1","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 95) {//Rotary 5 -
		client.send('{"requestType":"encoder","name":"GOBO1","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 96) {//Rotary 6 +
		client.send('{"requestType":"encoder","name":"GOBO2","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 97) {//Rotary 6 -
		client.send('{"requestType":"encoder","name":"GOBO2","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 98) {//Rotary 7 +
		client.send('{"requestType":"encoder","name":"FOCUS","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 99) {//Rotary 7 -
		client.send('{"requestType":"encoder","name":"FOCUS","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 100) {//Rotary 8 +
		client.send('{"requestType":"encoder","name":"ZOOM","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 101) {//Rotary 8 -
		client.send('{"requestType":"encoder","name":"ZOOM","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}

	/*
	//102-105 Encoders press in
	if (msg.note == 102) {//Encoder 1 press in
		encodervalue = 2;
	}
	if (msg.note == 103) {//Encoder 2 press in
		encodervalue = 1;
	}
	if (msg.note == 104) {//Encoder 3 press in
		encodervalue = 0.2;
	}
	if (msg.note == 105) {//Encoder 4 press in
		encodervalue = 0.02;
	}*/

});




//WEBSOCKET-------------------
var W3CWebSocket = require('websocket')
	.w3cwebsocket;

var client = new W3CWebSocket('ws://localhost:80/');


client.onerror = function () {
	console.log('Connection Error');
};

client.onopen = function () {
	console.log('WebSocket Client Connected');

	/*function sendNumber() {
		if (client.readyState === client.OPEN) {
			var number = Math.round(Math.random() * 0xFFFFFF);
			client.send(number.toString());
			setTimeout(sendNumber, 1000);
		}
	}
	sendNumber();*/
};

client.onclose = function () {
	console.log('echo-protocol Client Closed');
};

client.onmessage = function (e) {

	request = request + 1;

	if (request >= 9) {

		client.send('{"session":' + sessionnr + '}');
		request = 0;
	}


	if (typeof e.data == 'string') {

		obj = JSON.parse(e.data);

		if (obj.status == "server ready") {
			client.send('{"session":0}');
		}

		if (obj.forceLogin == true) {
			sessionnr = (obj.session);
			client.send('{"requestType":"login","username":"remote","password":"2c18e486683a3db1e645ad8523223b72","session":' + obj.session + ',"maxRequests":10}')
		}

		if (obj.responseType == "login" && obj.result === true) {
			if (interval_on == 0) {
                interval_on = 1;
                setInterval(interval, 500);//80
            }
		}
	}
};


