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

    //setup time
    this.clock = new THREE.Clock();
    this.time = 0;
    this.timestep = 0.1;

    //set-up listeners
    this.update_listeners = [];

    //set-up simulation stuff
    this.m=1;
}

Sim.prototype.add_update_listener = function(x) {
    this.update_listeners.push(x);
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
//    scene.add(this.box.mesh);    

    //if we have positions, then we render them
    if('undefined' !== typeof this.positions) {
	//create the geometric
	this.particles = {
	    'geom': new THREE.Geometry(),
	    'sprite': THREE.ImageUtils.loadTexture('assets/textures/ball.png')
	}
	//create the particle, set it transparent (so we can see through the png transparency) and color it
	this.particles.mat = new THREE.PointCloudMaterial( { size: this.particle_radius, sizeAttenuation: true, blending: THREE.Additive, map: this.particles.sprite, transparent: true, alphaTest: 0.5 } );
	this.particles.mat.color.setRGB( 0.0, 0.1, 1.0 );

	//now, we place vertices at each of the positions
	for(var i = 0; i < this.positions.length; i++) {
	    var vertex = new THREE.Vector3(this.resolution * this.positions[i][0], this.resolution * this.positions[i][1], this.resolution * this.positions[i][2]);
	    this.particles.geom.vertices.push(vertex);	    
	}


	//Store the geometry with the particles and make sure our sorting matches
	this.particles.cloud = new THREE.PointCloud(this.particles.geom, this.particles.mat);
	this.particles.sortParticles = true;
	scene.add(this.particles.cloud);

	//Creaete some velocities and positions
	this.velocities = [];
	this.forces = [];
	for(i = 0; i < this.positions.length; i++) {
	    this.velocities.push([(i % 2 + 1) * 2 - 3, (i % 2 + 1) * 2 - 3, 5 * i / this.positions.length]);
//	    this.velocities.push([Math.random(), Math.random(), Math.random()]);
	    this.forces.push([0, 0, 0]);
	}
	//create random ks
	this.ks = this.positions.map(function() {
	    return 0.75 + 0.05 * Math.random();	    
	});
	//create initial positions of them
	this.r0 = this.positions.map(function(x) {
	    return x.slice();
	});
	
    }

};


//this is the main loop
Sim.prototype.animate = function() {
    //treat listeners
//    this.update_listeners.forEach(function(x) {x.update()});
    this.update();   
    this.render();

}

Sim.prototype.render = function() {
    //this is where the rendering takes place
    
    if(this.particles) {
	for(var i = 0; i < this.positions.length; i++) {
	    this.particles.geom.vertices[i].x = this.resolution * this.positions[i][0];
	    this.particles.geom.vertices[i].y = this.resolution * this.positions[i][1];
	    this.particles.geom.vertices[i].z = this.resolution * this.positions[i][2];
	}
	this.particles.geom.verticesNeedUpdate = true;
    }
}

Sim.prototype.update = function() {

    //treat timing
    var delta = this.clock.getDelta();
    //target is 60 fps
    var timestep = this.timestep;
    if(1.0 / delta > 60) {
	timestep *= 60 * delta	
    }    

    //this is the actual simulation	
	
    this.integrate(timestep);
}

Sim.prototype.calculate_forces=function() {
    for(var i = 0; i < this.positions.length; i++) {
	var r=0;
	for(var j = 0; j < 3; j++) {
	    r+=Math.pow(this.positions[i][j]-this.r0[i][j],2);
	}
	r = Math.sqrt(r)
	for( j = 0; j < 3; j++) {
    	    
	    this.forces[i][j]=-this.ks[i]*(this.positions[i][j] - this.r0[i][j]); 
	    
	}
    }
}

Sim.prototype.integrate=function(timestep){

    var i,j;
    for(i = 0; i <  this.positions.length; i++) {
	for(j = 0; j < 3; j++) {
	    this.velocities[i][j]=this.velocities[i][j]+(0.5*timestep*this.forces[i][j]/this.m);
            this.positions[i][j]+=0.5*timestep*this.velocities[i][j];
	}	    	    	       
    }
    this.calculate_forces();
    for(i = 0; i <  this.positions.length; i++) {
	for(j = 0; j < 3; j++) {
	   this.velocities[i][j]=this.velocities[i][j]+(0.5*timestep*this.forces[i][j]/this.m);	     	     	   
	}	    	    	       
    }

}	
	
	
