// aweInit(id) : initialise awe sur un élément via son id.

var aweInit = function(id) {
  console.log('AWE init on : '+id);
	window.awe.init({
      device_type: awe.AUTO_DETECT_DEVICE_TYPE,
      settings: {
      	container_id: id,
        default_camera_position: { x:0, y:0, z:0 },
        default_lights:[
          {
            id: 'point_light',
            type: 'point',
            color: 0xFFFFFF,
          },
        ],
      },
      ready: function() {
        awe.util.require([
          {
            capabilities: ['gum','webgl'],
            files: [
              [ '../../js/awe-standard-dependencies.js', '../../js/awe-standard.js'],
              'awe-jsartoolkit-dependencies.js',
              'awe.marker_ar.js',
            ],
            success: function() {
								awe.setup_scene();			
			        awe.pois.add({ id:'poi_1', position: { x:0, y:0, z:0 }, visible: false });
					awe.pois.add({ id:'poi_2', position: { x:0, y:0, z:1 }, visible: false });
					
					
			        awe.projections.add({ 
			          id:'projection_1', 
								  //geometry: {shape:'cube', x: 20, y: 30,z:1},
								geometry: {shape: 'plane', height: 600, width: 900},
								//rotation: {x: 90, y: 0, z:0},réglage où la forme est bien alignée mais la vidéo à l'envers dessus...
								rotation: {x: 290, y: 0, z:0},
								position:{x: 0, y:0, z:0},
								//position: {x:0, y:0, z:0},
			          material: { color:0xFFFFFF },
					  texture: { path: 'textures/ra_cned.ogg'},				  
						}, { poi_id: 'poi_1' }),
						
					 
					
					 awe.projections.add({
					  id:'projection_2', 
								  //geometry: {shape:'cube', x: 20, y: 30,z:1},
								geometry: {shape: 'plane', height: 600, width: 300},
								//rotation: {x: 90, y: 0, z:0},réglage où la forme est bien alignée mais la vidéo à l'envers dessus...
								rotation: {x: 290, y: 0, z:0},
								position:{x: 0, y:0, z:0},
								//position: {x:0, y:0, z:0},
			          material: { color:0xFFFFFF },
					  texture: { path: 'textures/maman.ogg'},						  
						},{ poi_id: 'poi_2' });
						
			        awe.events.add([{
								id: 'ar_tracking_marker',
								device_types: {
									pc: 1,
									android: 1
								},
								register: function(handler) {
									window.addEventListener('ar_tracking_marker', handler, false);
								},
								unregister: function(handler) {
									window.removeEventListener('ar_tracking_marker', handler, false);
								},
								handler: function(event) {
									if (event.detail) {
										if (event.detail['64']) { // we are mapping marker #64 to this projection
											awe.pois.update({
												data: {
													visible: true,
                          position: { x:0, y:0, z:0 },
													matrix: event.detail['64'].transform
												},
												where: {
													id: 'poi_1'
												}
											});
										}
										
									
									
										
										else if (event.detail['63']) { // we are mapping marker #64 to this projection
											awe.pois.update({
												data: {
													visible: true,
                          position: { x:1, y:1, z:1 },
													matrix: event.detail['63'].transform
												},
												where: {
													id: 'poi_2'
												}
											});
										}
										
										
										else {
											awe.pois.update({
												data: {
													visible: false
												},
												where: {
													id: 'poi_1'
													
													
												}
												
											});
											awe.pois.update({
												data: {
													visible: false
												},
												where: {
													id: 'poi_2'
													
													
												}
												
											});
											
											
										}
										awe.scene_needs_rendering = 1;
									}
								}
							}])
			      },
          },
          {
            capabilities: [],
            success: function() { 
		          document.body.innerHTML = '<p>Try this demo in the latest version of Chrome or Firefox on a PC or Android device</p>';
            },
          },
		  
		  
        ]);
      }
    });
};
