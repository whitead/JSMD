function Scene(elements) {

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();
    var scene = this.scene

    elements.forEach(function(e) {
	e.init_render(scene);
    });
    
    this.renderer = new THREE.CanvasRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(this.renderer.domElement);
    
}

Scene.prototype.animate = function() {

    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
    
};

