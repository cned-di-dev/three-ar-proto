/*jslint browser:true */
/*global THREE, THREEx, alert, AR, POS, requestAnimationFrame*/

var videoWebcam, canvas, context, imageData, detector, posit;
var markers;
var rendererLeftDebug, rendererRightDebug, rendererLeftEye, rendererRightEye;
var sceneLeftDebug, sceneRightDebug, sceneLeftEyeWebcam, sceneLeftEyeProjection, sceneRightEyeWebcam, sceneRightEyeProjection;
var cameraLeftDebug, cameraRightDebug, cameraLeftEyeWebcam, cameraLeftEyeProjection, cameraRightEyeWebcam, cameraRightEyeProjection;
var planeLeftDebug, planeRightDebug, modelLeftEye, modelRightEye, textureLeftEye, textureRightEye;
var step = 0.0;
var updateFcts	= [];
var modelSize = 35.0; //millimeters

function createRenderers() {//on crée les différents rendus selon les divs
    "use strict";
    

    rendererLeftEye = new THREE.WebGLRenderer({antialias: true});
    rendererLeftEye.setClearColor(0xffffff, 1);
    rendererLeftEye.setSize(canvas.width * 4/3, canvas.height);
    document.getElementById("containerLeftEye").appendChild(rendererLeftEye.domElement);
    // effect = new THREE.StereoEffect(rendererLeftEye);//ajout
    sceneLeftEyeWebcam = new THREE.Scene();
    cameraLeftEyeWebcam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    //cameraLeftEyeWebcam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    sceneLeftEyeWebcam.add(cameraLeftEyeWebcam);
    sceneLeftEyeProjection = new THREE.Scene();//canvas à doite en haut où se projette la vidéo en ar
    //cameraLeftEyeProjection = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
	//cameraLeftEyeProjection = new THREE.PerspectiveCamera(52, canvas.width*4/5 / canvas.height*4/3.97, 1, 1000 );
	cameraLeftEyeProjection = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
    sceneLeftEyeProjection.add(cameraLeftEyeProjection);

    rendererRightEye = new THREE.WebGLRenderer({antialias: true});
    rendererRightEye.setClearColor(0xffffff, 1);
    rendererRightEye.setSize(canvas.width * 4/3, canvas.height);
    document.getElementById("containerRightEye").appendChild(rendererRightEye.domElement);
    sceneRightEyeWebcam = new THREE.Scene();
    cameraRightEyeWebcam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5 );
    //camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    sceneRightEyeWebcam.add(cameraRightEyeWebcam);
    sceneRightEyeProjection = new THREE.Scene();//canvas à doite en haut où se projette la vidéo en ar
    //cameraRightEyeProjection = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
	//cameraRightEyeProjection = new THREE.PerspectiveCamera(52, canvas.width *4/5/ canvas.height*4/3.97, 1, 1000 );
	cameraRightEyeProjection = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
	
    sceneRightEyeProjection.add(cameraRightEyeProjection);0
}

function createPlane() {
    "use strict";
    var object = new THREE.Object3D(),
        geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0),
        material = new THREE.MeshNormalMaterial(),
        mesh = new THREE.Mesh(geometry, material);

    object.add(mesh);

    return object;
}

function createWebcamTexture() {
    "use strict";
    var texture,
        object,
        geometry,
        material,
        mesh;
    texture = new THREE.Texture(videoWebcam);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    object = new THREE.Object3D();
    geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0);
	//geometry = new THREE.BoxGeometry(1.0, 1.0, 0.0);
    material = new THREE.MeshBasicMaterial({map: texture,
        depthTest: false,
        depthWrite: false});
    mesh = new THREE.Mesh(geometry, material);
    object.position.z = -1;
    object.add(mesh);
    return object;
}

function createProjectionTexture() {
    "use strict";
    // scene = new THREE.Scene();
    var url,
	    canPlayMp4	= document.createElement('video').canPlayType('video/mp4') !== '' ? true : false,
	    canPlayOgg	= document.createElement('video').canPlayType('video/ogg') !== '' ? true : false,
        canPlayWmv = document.createElement('video').canPlayType('video/wmv') !== '' ? true : false,
         //Initialisation des vidéos à lancer sur la forme
        imageContext,
        videoTexture,
        texture,
        object,
        geometry,
        material,
        mesh;
    //projetée
	if (canPlayWmv) {
		url = 'textures/mot_arabe.wmv';
	}else if	(canPlayMp4) {
        url	= 'textures/mot_arabe.mp4';
    }
	else if (canPlayOgg) {
        url	= 'textures/mot_arabe.ogg';
    } 
	
     else {
        alert('cant play mp4 or ogv'); //appel des vidéos selon le format supporté par le navigateur
    }
    // create the videoTexture
    videoTexture = new THREEx.VideoTexture(url); //on crée une texture vidéo
    texture = videoTexture.texture;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    updateFcts.push(function (delta, now) {
        videoTexture.update(delta, now);
    });
    object = new THREE.Object3D();//on crée le plane
	//geometry = new THREE.PlaneGeometry(3, 3, 0.0); //
	geometry	= new THREE.BoxGeometry(2,3,0),
   
   material = new THREE.MeshBasicMaterial({ //On ajoute la vidéo texture à la forme créée
        map	: videoTexture.texture,
        transparent: false,
        opacity: 1
    });
    //transparent: true, opacity: 0.5 si on met ça, on rend la vidéo transparente mais pas l'objet lui même...
    mesh = new THREE.Mesh(geometry, material);
    object.add(mesh);
    return object;
	
	cameraRightEyeProjection.lookAt(videoTexture.position);
	camera.position.distanceTo( videoTexture.position );
	cameraLeftEyeProjection.lookAt(videoTexture.position);
	camera.position.distanceTo( videoTexture.position );
    //J'enlève et la rotation de l'objet et le on off pour la vidéo
    //updateFcts.push(function(delta, now){
    //	mesh.rotation.x += 1 * delta;
    //	mesh.rotation.y += 2 * delta;		
    //})
    //function onVideoPlayButtonClick(){
    //	video.play()
    //}
    //function onVideoPauseButtonClick(){
    //	video.pause()
    //}
	
	
}

function createScenes() { // on crée les scènes qui seront affichées
    "use strict";
   

    textureLeftEye = createWebcamTexture();
    sceneLeftEyeWebcam.add(textureLeftEye);

    modelLeftEye = createProjectionTexture();
    sceneLeftEyeProjection.add(modelLeftEye);

    textureRightEye = createWebcamTexture();
    sceneRightEyeWebcam.add(textureRightEye);

    modelRightEye = createProjectionTexture();
    sceneRightEyeProjection.add(modelRightEye);

}

function snapshot() {
    "use strict";
    context.drawImage(videoWebcam, 0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);//Dessin de la vidéo d'enregistrement
	}

function drawCorners(markers) {//on dessine en temps réel les coins du marqueur sur le marqueur fenêtre de gauche en haut 
    "use strict";
    var corners, corner, i, j;

    context.lineWidth = 3;

    for (i = 0; i < markers.length; ++i) {
        corners = markers[i].corners;
        context.strokeStyle = "red";
        context.beginPath();

        for (j = 0; j < corners.length; ++j) {
            corner = corners[j];
            context.moveTo(corner.x, corner.y);
            corner = corners[(j + 1) % corners.length];
            context.lineTo(corner.x, corner.y);
        }

        context.stroke();
        context.closePath();
        context.strokeStyle = "green";
        context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
    }
}

function updateObject(object, rotation, translation) {//Mise à jour de l'objet projeté en temps réel
    "use strict";
    object.scale.x = modelSize ;
    object.scale.y = modelSize;
    object.scale.z = modelSize;

    object.rotation.x = -Math.asin(-rotation[1][2]) ;
    object.rotation.y = -Math.atan2(rotation[0][2] -0.388, rotation[2][2]);
    object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

	object.position.x = translation[0] +100;
    object.position.y = translation[1]-30;
    object.position.z = -translation[2]-1.4;
	
  
}

function updatePose(id, error, rotation, translation) { // les retours si arrêt de reconnaissance du marqueur, je crois
    "use strict";
    var yaw = -Math.atan2(rotation[0][2], rotation[2][2]),
        pitch = -Math.asin(-rotation[1][2]),
        roll = Math.atan2(rotation[1][0], rotation[1][1]),
        d = document.getElementById(id);
    d.innerHTML = " error: "
        + error
        + "<br/>"
        + " x: " + (translation[0] | 0)
        + " y: " + (translation[1] | 0)
        + " z: " + (translation[2] | 0)
        + "<br/>"
        + " yaw: " + Math.round(-yaw * 180.0 / Math.PI)
        + " pitch: " + Math.round(-pitch * 180.0 / Math.PI)
        + " roll: " + Math.round(roll * 180.0 / Math.PI);
}

function updateScenes(markers) { //mise à jour de la scène
    "use strict";
    var corners, corner, pose, i;
    if (markers.length > 0) {
        corners = markers[0].corners;

        for (i = 0; i < corners.length; ++i) {
            corner = corners[i];
            corner.x = corner.x - (canvas.width/ 2 );
            corner.y = (canvas.height/ 2) - corner.y;
        }

        pose = posit.pose(corners);
        //updateObject(planeLeftDebug, pose.bestRotation, pose.bestTranslation);
       // updateObject(planeRightDebug, pose.alternativeRotation, pose.alternativeTranslation);
        updateObject(modelLeftEye, pose.bestRotation, pose.bestTranslation) ;
        updateObject(modelRightEye, pose.bestRotation, pose.bestTranslation) ;
        //updatePose("pose1", pose.bestError, pose.bestRotation, pose.bestTranslation);
        //updatePose("pose2", pose.alternativeError, pose.alternativeRotation, pose.alternativeTranslation);
        step += 0.025;
        // model.rotation.z -= step;
    }

    textureLeftEye.children[0].material.map.needsUpdate = true;//Permet de lancer la vidéo d'enregistrement en fenêtre de droite en haut et de l'actualiser
    textureRightEye.children[0].material.map.needsUpdate = true;//Permet de lancer la vidéo d'enregistrement en fenêtre de droite en haut et de l'actualiser

}

function render() {//on crée les différents rendus selon les div
    "use strict";
    

    rendererLeftEye.autoClear = false;
    rendererLeftEye.clear();
    rendererLeftEye.render(sceneLeftEyeWebcam, cameraLeftEyeWebcam);
    rendererLeftEye.render(sceneLeftEyeProjection, cameraLeftEyeProjection);//Projection du modèle

    rendererRightEye.autoClear = false;
    rendererRightEye.clear();
    rendererRightEye.render(sceneRightEyeWebcam, cameraRightEyeWebcam);
    rendererRightEye.render(sceneRightEyeProjection, cameraRightEyeProjection);
}

function tick() {
    "use strict";
    requestAnimationFrame(tick);

    if (videoWebcam.readyState === videoWebcam.HAVE_ENOUGH_DATA) {
        snapshot(); //on lance la vidéo et on la projette dans le canvas

        var markers = detector.detect(imageData);
        drawCorners(markers); //on dessine en temps réel les coins du marqueur
        updateScenes(markers); //on met à jour la détection des marqueurs sans cesse

        render(); //appel de la fonction "rendre"
    }
}

function init() {
    "use strict";
    navigator.getUserMedia({video: true}, // on peut utiliser la vidéo
        function (stream) {
            if (window.webkitURL) {
                videoWebcam.src = window.webkitURL.createObjectURL(stream);
            } else if (videoWebcam.mozSrcObject !== undefined) {
                videoWebcam.mozSrcObject = stream;
            } else {
                videoWebcam.src = stream;//selon les navigateurs on crée une url pour lancer l'enregistrement
            }
        },
        function (error) {
        }
        );

    detector = new AR.Detector();//on appelle la détection
	//detector.id = 0;//ajout pour le marqueur
    posit = new POS.Posit(modelSize, window.innerWidth/2);//on appelle la mise à jour de la détection et je CHANGE EN WINDOW LE CANVAS
//et je le divise par 2
    createRenderers();//fonction qui crée le rendu
    createScenes();//celle qui crée la scène

    requestAnimationFrame(tick);//celle qui actualise la scène et donc ici télescopage car il faut actualiser aussi la vidéo projetée
    //le nouveau canvas étant créé je peux lancer l'animation et l'actualisation de la vidéo sur le plane

    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec	= lastTimeMsec || nowMsec - 1000 / 60;//Je diminue la valeur à 100 pour améliorer 
		//la stabilité de le projection
        var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec	= nowMsec;
         //call each update function
        updateFcts.forEach(function (updateFn) {
            updateFn(deltaMsec / 1000, nowMsec / 1000);//Je mets 100 au lieu de mille pour améliorer la 
			//stabilité de la projection.
        });
    });
//La méthode window.requestAnimationFrame() notifie le navigateur que vous souhaitez executer une animation et demande que celui-ci execute une 
//fonction spécifique de mise à jour de l'animation, avant le prochain repaint du navigateur. Cette méthode prend comme argument un callback qui sera
// appelé avant le repaint du navigateur.
}

function onLoad() {
    "use strict";
    videoWebcam = document.getElementById("video");
    canvas = document.getElementById("baseCanvas");
    context = canvas.getContext("2d");
   canvas.width = window.innerWidth /2 ;//au lieu de window.innerWidth /2
     canvas.height = window.innerHeight;//initialisation du canvas
	
     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (navigator.getUserMedia) {
        init();
    } //vérification de la possiblité d'utiliser la vidéo dans le navigateur
}

window.onload = onLoad; //on lance window.onload