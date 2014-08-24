/*
* box_dim : a THREE.Vector3 specifying the box dimension 
*/

function Sim(box_dim, viewwidth, viewheight) {
    
    //lazy longest diagonal
    var max = 0;
    box_dim.forEach(function(x) {max = Math.max(max, x)});
    var resolution = Math.min(viewwidth, viewheight) / (max * Math.sqrt(3))

    this.resolution = resolution;
    this.box_dim = new THREE.Vector3(box_dim[0], box_dim[1], box_dim[2]);
    this.transform = new THREE.Matrix4();
    this.transform.makeScale(resolution, resolution, resolution);    

    this.particle_radius = 25;
}

Sim.prototype.set_positions = function(positions) {
    this.positions = positions;
}

Sim.prototype.init_render = function(scene) {
    //draw simulation box
    var geomDim = this.box_dim.applyMatrix4(this.transform);
    this.box = { 
	'geom': new THREE.BoxGeometry(geomDim.x, geomDim.y, geomDim.z),
	'material': new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
	})};

    this.box.mesh = new THREE.Mesh(this.box.geom, this.box.material);
    scene.add(this.box.mesh);    


    if('undefined' !== typeof this.positions) {
	this.particles = {
	    'geom': new THREE.Geometry(),
	    'sprite': THREE.ImageUtils.loadTexture('assets/textures/ball.png'),
	}
	this.particles.mat = new THREE.PointCloudMaterial( { size: this.particle_radius, sizeAttenuation: true, map: this.particles.sprite, transparent: true } );
	this.particles.mat.color.setHSL( 1.0, 0.3, 0.7 );
	
	for(var i = 0; i < this.positions.length; i++) {
	    var vertex = new THREE.Vector3(this.resolution * this.positions[i][0], this.resolution * this.positions[i][1], this.resolution * this.positions[i][2]);
	    this.particles.geom.vertices.push(vertex);	    
	}


	this.particles.cloud = new THREE.PointCloud(this.particles.geom, this.particles.mat);
	this.particles.sortParticles = true;
	scene.add(this.particles.cloud);
    }

};

Sim.prototype.animate = function() {

    if(this.particles) {
	for(var i = 0; i < this.positions.length; i++) {
	    this.particles.geom.vertices[i].x = this.resolution * this.positions[i][0];
	    this.particles.geom.vertices[i].y = this.resolution * this.positions[i][1];
	    this.particles.geom.vertices[i].z = this.resolution * this.positions[i][2];
	}
	this.particles.geom.verticesNeedUpdate = true;
    }
    
}
