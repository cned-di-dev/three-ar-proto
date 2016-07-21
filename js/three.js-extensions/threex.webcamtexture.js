var THREEx = THREEx || {}

THREEx.WebcamTexture	= function(){
	console.assert(THREEx.WebcamTexture.available === true)
	// create the video element
	var video	= document.createElement('video');
	video.width	= 320;
	video.height	= 240;
	video.autoplay	= true;
	video.loop	= true;
	// expose video as this.video
	this.video	= video
	navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);
	if (navigator.getUserMedia) {
	  // Request the camera.
	  navigator.getUserMedia(
		    // Constraints
		    {
		      video: {facingMode: {exact: 'environment'}}
		    },

		    // Success Callback
		    function(localMediaStream) {
					video.src	= URL.createObjectURL(localMediaStream);
		    },

		    // Error Callback
		    function(err) {
		      // Log the error to the console.
		      alert('The following error occurred when trying to use getUserMedia: ' + err.name);
		    }
		  );

	} else {
	  alert('Sorry, your browser does not support getUserMedia');
	}


	// create the texture
	var texture	= new THREE.Texture( video );
	// expose texture as this.texture
	this.texture	= texture

	/**
	 * update the object
	 */
	this.update	= function(delta, now){
		if( video.readyState !== video.HAVE_ENOUGH_DATA )	return;
		texture.needsUpdate	= true;
	}

	/**
	 * destroy the object
	 */
	this.destroy	= function(){
		video.pause()
	}
}


THREEx.WebcamTexture.available	= navigator.webkitGetUserMedia || navigator.mozGetUserMedia ? true : false;
