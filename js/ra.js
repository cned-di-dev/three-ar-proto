navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

var camvideo = document.getElementById('monitor');

if (!navigator.getUserMedia) {
    document.getElementById('errorMessage').innerHTML =
        'Sorry. <code>navigator.getUserMedia()</code> is not available.';
}
navigator.getUserMedia({
    video: true
}, gotStream, noStream);

function gotStream(stream) {
    if (window.URL) {
        camvideo.src = window.URL.createObjectURL(stream);
    } else // Opera
    {
        camvideo.src = stream;
    }

    camvideo.onerror = function(e) {
        stream.stop();
    };

    stream.onended = noStream;
}

function noStream(e) {
    var msg = 'No camera available.';
    if (e.code == 1) {
        msg = 'User denied access to use camera.';
    }
    document.getElementById('errorMessage').textContent = msg;
}




// global variables
var video, videoImage, videoImage1, videoImageContext, videoImage1Context, videoWebcam, bodyEl, gauche, droite;

// assign variables to HTML elements
video = document.getElementById('monitor');
videoImage = document.getElementById('videoImage');
videoImage1 = document.getElementById('videoImage1');
videoImageContext = videoImage.getContext('2d');
videoImage1Context = videoImage1.getContext('2d');
// background color if no video present
videoImageContext.fillStyle = '#005337';
videoImage1Context.fillStyle = '#005337';
videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);
videoImage1Context.fillRect(0, 0, videoImage1.width, videoImage1.height);
// start the loop
animate();

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        videoImageContext.drawImage(video, 0, 0, videoImage.height * 4 / 3, videoImage.height);
        videoImage1Context.drawImage(video, 0, 0, videoImage1.height * 4 / 3, videoImage1.height); //redéfinir la taille du canvas
    }
}


function onLoad() {


		"use strict";
		bodyEl = document.getElementById("raApp");
    videoWebcam = document.getElementById("monitor");
    videoImage = document.getElementById('videoImage');
    videoImage1 = document.getElementById('videoImage1');
    gauche = document.getElementById("gauche");
    droite = document.getElementById("droite");

		bodyEl.style.height = window.innerHeight+'px';

    //initialisation du canvas
    videoImage.width = window.innerWidth / 2;
    videoImage.height = window.innerHeight;
    videoImage1.width = window.innerWidth / 2;
    videoImage1.height = window.innerHeight;
		aweInit();
}

// AWE init
function aweInit() {
	console.log('AWE init');
	// Maintenant : initialise AWE sur une seule vidéo (celle de gauche par exemple)
}




window.onload = onLoad;
