/*
* box_dim : a THREE.Vector3 specifying the box dimension
* resolution : pixels per box_dim units
*/

function Sim(box_dim, resolution) {
    this.resolution = resolution;
    this.box_dim = box_dim;
    this.transform = new THREE.Matrix4();
    this.transform.makeScale(resolution, resolution, resolution);    
}

Sim.prototype.init_render = function(scene) {
    //draw simulation box
    this.box = { 
	'geom': new THREE.BoxGeometry(this.box_dim.applyMatrix4(this.transform)),
	'material': new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
	})};

    this.box.mesh = new THREE.Mesh(this.box.geom, this.box.material);
    scene.add(this.box.mesh);    
};

Sim.prototype.animate = function() {
    this.box.mesh.rotation.x += 0.01;
    this.box.mesh.rotation.y += 0.02;
}
