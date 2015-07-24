function Scene(elements, root) {

    this.elements = elements;

    //this.container = document.createElement( 'div' );
    //document.body.appendChild( root );

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = Math.min(window.innerWidth, window.innerHeight);

    this.controls = new THREE.OrbitControls( this.camera, root );
    this.controls.damping = 0.2;
//    this.controls.maxPolarAngle = Math.PI / 2;
//    this.controls.minAzimuthAngle = -Math.PI / 2;
//    this.controls.maxAzimuthAngle = Math.PI / 2;
    this.controls.addEventListener( 'change', this.render.bind(this) );

    this.scene = new THREE.Scene();
    var scene = this.scene;


    this.renderer = new THREE.WebGLRenderer( { clearAlpha: 1 } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    root.appendChild( this.renderer.domElement );

    window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    this.controls.addEventListener('change', this.render.bind(this));

    elements.forEach(function(e) {
	e.init_render(scene);
    });

    //set-up the performance stats
    this.stats = new Stats();
    
     // align bottom-left
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.bottom = '0px';
    
    root.appendChild( this.stats.domElement );


        
}

Scene.prototype.onWindowResize = function() {
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    
    this.render();
    
}

Scene.prototype.animate = function() {

    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
};


Scene.prototype.render = function() {

    this.elements.forEach(function(e) {
	e.animate();
    });

    this.renderer.render( this.scene, this.camera );
    
}


