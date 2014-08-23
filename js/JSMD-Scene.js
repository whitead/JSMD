function Scene(elements) {

    this.elements = elements;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 25;

    this.scene = new THREE.Scene();
    var scene = this.scene

    this.renderer = new THREE.CanvasRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(this.renderer.domElement);

    elements.forEach(function(e) {
	e.init_render(scene);
    });
        
}

Scene.prototype.animate = function() {

    requestAnimationFrame(this.animate.bind(this));

    this.elements.forEach(function(e) {
	e.animate();
    });


    this.renderer.render(this.scene, this.camera);
    
};

