// Main variables
var video,
    currentVideoEl,
    videoSrcList = [
        "../../videos/intro-lg.mp4",
        "../../videos/ar-papa-lg.mp4",
        "../../videos/ar-maman-lg.mp4",
        "../../videos/a-lent-lg.mp4",
        "../../videos/a-rapide-lg.mp4",
        "../../videos/m-lent-lg.mp4",
        "../../videos/m-rapide-lg.mp4",
        "../../videos/ar-garcon-lg.mp4",
        "../../videos/ar-fille-lg.mp4",
        "../../videos/ch-maman-lg.mp4",
        "../../videos/ch-papa-lg.mp4"
    ],
    // DOM elements
    launchBtn = document.getElementById('launch-btn');

// Add transparency to white tones on video
ChromaKeyMaterial = function(url, width, height, keyColor) {
    THREE.ShaderMaterial.call(this);
    video = document.createElement('video');
    video.loop = false;
    video.src = url;
    video.load();

    var videoImage = document.createElement('canvas');
    if (window.URL){
			document.body.appendChild(videoImage);
		}
    videoImage.width = width;
    videoImage.height = height;
    videoImage.style.display = 'none';
    var keyColorObject = new THREE.Color(keyColor);
    var videoImageContext = videoImage.getContext('2d');
    // background color if no video present
    videoImageContext.fillStyle = '#' + keyColorObject.getHexString();
    videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);
    var videoTexture = new THREE.Texture(videoImage);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    this.update = function() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            videoImageContext.drawImage(video, 0, 0);
            if (videoTexture) {
                videoTexture.needsUpdate = true;
            }
        }
    };
    this.setValues({
        uniforms: {
            texture: {
                type: "t",
                value: videoTexture
            },
            color: {
                type: "c",
                value: keyColorObject
            }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        transparent: true
    });
};
ChromaKeyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

// Loading JSARToolkit stuff
window.ARThreeOnLoad = function() {

    ARController.getUserMediaThreeScene({
        maxARVideoSize: 640,
        cameraParam: 'Data/camera_para.dat',
        facing: {
            exact: 'environment'
        },
        facingMode: {
            exact: 'environment'
        },
        onSuccess: function(arScene, arController, arCamera) {

            document.body.className = arController.orientation;

            arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);

            var rendererL = new THREE.WebGLRenderer({
                    antialias: true
                }),
                rendererR = new THREE.WebGLRenderer({
                    antialias: true
                }),
                rendererWidth = window.innerWidth / 2,
                ratio = arController.videoWidth / arController.videoHeight;
            rendererL.setSize(rendererWidth, rendererWidth / ratio);
            rendererR.setSize(rendererWidth, rendererWidth / ratio);


            document.body.insertBefore(rendererL.domElement, document.body.firstChild);
            document.body.insertBefore(rendererR.domElement, document.body.firstChild);
            var rotationV = 0;
            var checkDuration = 500;
            var RAMarker = function(id) {
                this.videoSrc = videoSrcList[id];
                this.markerId = id;
                this.ts = 0;
                this.visible = false;
            };
						// Looping and setting markers based on video src list
            var markers = {};

            for(var i = 0; i < videoSrcList.length; i++) {
                markers['marker-' + i] = new RAMarker(i);
            }

            var geometry = new THREE.PlaneGeometry(4.3, 3.3); // 4:3
            var movieMaterial = new ChromaKeyMaterial(videoSrcList[0], 1280, 720, 0xffffff);
            var cube = new THREE.Mesh(
                geometry,
                movieMaterial
            );
            cube.material.shading = THREE.FlatShading;
            cube.position.z = 0;
            cube.position.x = 2.8;
            cube.position.y = -1;
            var markerRoot = arController.createThreeBarcodeMarker(0);
            markerRoot.add(cube);
            arScene.scene.add(markerRoot);


            var firstFrame = 0;

            function initVideo(video) {
                currentVideoEl = video;
                currentVideoEl.addEventListener('ended', function() {
                    onVideoEnded(currentVideoEl);
                });

            }

            function handleNewMarker(newMarker) {
                var ts = Date.now();
                if (newMarker === 0) {
                    if (markers['marker-' + newMarker].visible === false) {
                        markers['marker-' + newMarker].visible = true;
                        updateVideo(markers['marker-' + newMarker].videoSrc);
                        console.info('Changed marker-' + newMarker + '.visible to true');

                    }
                    markers['marker-' + newMarker].ts = ts;



                } else if (newMarker > 0) {
                  if(typeof markers['marker-' + newMarker] != 'undefined'){
                    if (markers['marker-' + newMarker].visible === false) {
                        markers['marker-' + newMarker].visible = true;
                        if (markers['marker-1'].visible) {
                            updateVideo(markers['marker-' + newMarker].videoSrc);
                        }
                        console.info('Changed marker-' + newMarker + '.visible to true');
                    }
                    markers['marker-' + newMarker].ts = ts;
                  }

                }




            }

            function checkMarkerVisible() {
                var ts = Date.now();
                for (var i = 0; i < videoSrcList.length; i++) {
                    if (markers['marker-' + i].ts < ts - checkDuration && markers['marker-' + i].visible) {
                        markers['marker-' + i].visible = false;
                        if (i) {
                            updateVideo(markers['marker-' + i].videoSrc);
                        } else {
                            updateVideo();
                        }
                        console.info('Changed marker-' + i + '.visible to false');
                    }
                }


            }


            function onEachFrame() {
                checkMarkerVisible();

            }


            arController.addEventListener('getMarker', function(e) {
                var marker = e.data.marker.idMatrix;
                if (e.data.type > -1 && marker > -1) {
                    handleNewMarker(marker);
                }
            });

            function updateVideo(videoSrc) {


                // on ne met à jour que si la nouvelle source est différente de l'ancienne
                if (typeof videoSrc !== 'undefined') {
                    if (videoSrc !== currentVideoEl.src) {

                        currentVideoEl.src = videoSrc;
                        console.info('Updating video src : ' + currentVideoEl.src);
                        setTimeout(function (){
                            currentVideoEl.play();
                        }, 150);
                        
                    }
                } else {
                    currentVideoEl.pause();
                    currentVideoEl.src = videoSrcList[0];
                }


            }

            function onVideoEnded() {
                currentVideoEl.pause();

                setTimeout(function() {
                    currentVideoEl.currentTime = 0;
                    currentVideoEl.play();
                }, 5000);
            }


            var tick = function() {
                arScene.process();
                cube.rotation.z += rotationV;
                rotationV *= 0.8;
                movieMaterial.update();
                arScene.renderOn(rendererL);
                arScene.renderOn(rendererR);
                requestAnimationFrame(tick);
                onEachFrame();
                if (firstFrame === 0) {
                    // On attache l'écouteur qu'une fois, en passant video comme argument de la fonction (ça nous permet d'y accéder en dehors de update() )
                    firstFrame++;
                    initVideo(video);

                }



            };

            tick();

        }
    });

    delete window.ARThreeOnLoad;

};
launchBtn.addEventListener('click', function() {
    if (window.ARController && ARController.getUserMediaThreeScene) {
        ARThreeOnLoad();
    }
});
