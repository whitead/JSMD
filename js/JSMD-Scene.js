//JSMD-Scene.js

function Scene(elements, root, ortho, light_background, stats, controls, fov, renderer) {

    this.elements = elements;
    this.root = root;
     
    ortho = ortho || false;
    controls = controls || true;
    fov = fov || 75;
     
     if(ortho) {
	 var factor = 0.5 * Math.tan(fov / 360 * Math.PI);
	 this.camera = new THREE.OrthographicCamera( this.root.clientWidth * -factor, this.root.clientWidth * factor, this.root.clientHeight * factor, this.root.clientHeight * -factor, 1, 10000 );
	 this.camera.zoom = 1;
	 
     } else{
	 this.camera = new THREE.PerspectiveCamera(75, this.root.clientWidth / this.root.clientHeight, 1, 10000);	 
     }

    if(controls) {
	 this.controls = new THREE.OrbitControls( this.camera, root );
	 this.controls.damping = 0.2;
	 this.controls.addEventListener( 'change', this.render.bind(this) );
    }

    this.camera.position.z = Math.min(this.root.clientWidth, this.root.clientHeight);	     
    this.scene = new THREE.Scene();

     


    if(!renderer) {
	this.renderer = new THREE.WebGLRenderer( { clearAlpha: 1, antialias: true } );
    
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize( this.root.clientWidth, this.root.clientHeight );
	this.renderer.setClearColor( 0x000000, 1 );
	
	root.appendChild( this.renderer.domElement );
	window.addEventListener( 'resize', this.onWindowResize.bind(this), false );     
	
	if(light_background)
	    this.renderer.setClearColor( 0xFFFFFF, 1 );
    } else {
	this.renderer = renderer;
    }
    
    var scene = this.scene;    
     elements.forEach(function(e) {
	 e.init_render(scene);
     });

    if(stats) {
	//set-up the performance stats
	this.do_stats = true;
	this.stats = new Stats();
	
	// align bottom-left
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.left = '0px';
	this.stats.domElement.style.bottom = '0px';
	
	root.appendChild( this.stats.domElement );
    } else {
	this.do_stats = false;
    }
     

 }

Scene.prototype.onWindowResize = function() {
    
    this.camera.aspect = this.root.clientWidth / this.root.clientHeight;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize( this.root.clientWidth, this.root.clientHeight );
    
    this.render();
    
}

Scene.prototype.animate = function() {
    
    requestAnimationFrame(this.animate.bind(this));
    this.render();
}


Scene.prototype.render = function() {
    
    this.elements.forEach(function(e) {
	e.animate();
    });

    if(this.do_stats)
	this.stats.update();
    
    
    this.renderer.render( this.scene, this.camera );
    
}



function MultiScene(light_background) {

    this.renderer = new THREE.WebGLRenderer( { clearAlpha: 1, antialias: true } );
    
    this.renderer.setPixelRatio( window.devicePixelRatio );
    //this.renderer.setSize( this.root.clientWidth, this.root.clientHeight );
    this.renderer.setClearColor( 0x000000, 1 );    
    if(light_background)
	this.renderer.setClearColor( 0xFFFFFF, 1 );

    this.scenes = [];
}

MultiScene.prototype.add_scene = function(elements, root,  ortho, stats, controls, fov) {
    this.scenes.push(new Scene(elements, root, ortho, false, stats, controls, fov, this.renderer)); 
}


MultiScene.prototype.animate = function() {

    this.render();    
    requestAnimationFrame(this.animate.bind(this));
}

MultiScene.prototype.render = function() {
    
    this.scenes.forEach(function(s) {
	s.render();
    });
}


MultiScene.prototype.updateSize = function() {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if ( canvas.width !== width || canvas.height != height ) {
	renderer.setSize( width, height, false );
    }
}
