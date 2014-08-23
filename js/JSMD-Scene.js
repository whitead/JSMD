function Scene(elements) {

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 5;

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
    this.renderer.render(this.scene, this.camera);
    
};

