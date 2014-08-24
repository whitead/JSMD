function Scene(elements, root) {

    this.elements = elements;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = Math.min(window.innerWidth, window.innerHeight);

    this.controls = new THREE.OrbitControls( this.camera );
    this.controls.damping = 0.2;
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
    
};


Scene.prototype.render = function() {

    this.elements.forEach(function(e) {
	e.animate();
    });

    this.renderer.render( this.scene, this.camera );
    
}


