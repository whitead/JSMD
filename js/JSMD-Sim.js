
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


    //setup time
    this.clock = new THREE.Clock();
    this.time = 0;
    this.steps = 0;
    this.timestep = 0.02

    //set-up listeners
    this.update_listeners = [];

    //set-up simulation stuff
    this.m=1;
    this.epsilon=1;

    this.sigma=0.5;
    this.kb=1;
    this.T=1.3;
    this.particle_radius = this.sigma * 150;
    var a = createTimeline();
    this.energy_chart = a[0];
    this.temperature_chart = a[1];
    


    
}

Sim.prototype.add_update_listener = function(x) {
    this.update_listeners.push(x);
}

Sim.prototype.set_positions = function(positions) {
    this.positions = positions;
}

Sim.prototype.init_render = function(scene) {
    //draw simulation box

    var geomDim = this.box_dim.clone().applyMatrix4(this.transform);
    this.box = { 
	'geom': new THREE.BoxGeometry(geomDim.x, geomDim.y, geomDim.z),
	'material': new THREE.MeshBasicMaterial({
           color:  0xff0000,
            wireframe: true
	})};

    this.box.mesh = new THREE.Mesh(this.box.geom, this.box.material);
    scene.add(this.box.mesh);


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
	var sig= Math.sqrt(this.kb*this.T/this.m);
	var nd = new NormalDistribution(sig,0); 
	for(i = 0; i < this.positions.length; i++) {
	    this.velocities.push([nd.sample(), nd.sample(), nd.sample()]);
	    this.forces.push([0, 0, 0]);
	}
	//create random ks

	//this.ks = this.positions.map(function() {
	    //return 0.75 + 0.05 * Math.random();	    
	

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

function rounded(number){
    if(number<0){
        return (Math.ceil(number-0.5));
    }
    else{
        return (Math.floor(number+0.5));
    }
}
Sim.prototype.min_image_dist=function(x1,x2){
    var change=x1-x2;

    return ((change -rounded(change/this.box_dim.x)*this.box_dim.x) );

}
Sim.prototype.wrap=function(sos){
    return (sos-Math.floor(sos/this.box_dim.x)*this.box_dim.x);
}


Sim.prototype.render = function() {
    //this is where the rendering takes place
    
    if(this.particles) {
	for(var i = 0; i < this.positions.length; i++) {
	    this.particles.geom.vertices[i].x = this.resolution * (this.wrap(this.positions[i][0]) - this.box_dim.x / 2);
								 
	    this.particles.geom.vertices[i].y = this.resolution * (this.wrap(this.positions[i][1]) - this.box_dim.y / 2);
	    this.particles.geom.vertices[i].z = this.resolution * (this.wrap(this.positions[i][2]) - this.box_dim.z / 2);
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
Sim.prototype.minimum_distance=function(position1, position2){
    var difference=(position1-position2)/this.box_dim.x;
    var difference2=position1-position2-Math.floor(difference)*this.box_dim.x;
    var dx2= this.box_dim.x-Math.abs(difference2);
    if (Math.abs(difference2)>dx2){

	return (Math.abs(dx2));

    }
    else {
	return (Math.abs(difference2));
   }
}

/*
* This calculates the LJ force on each particle, updates the forces
* array and computes total potential energy.
*/

Sim.prototype.calculate_forces=function() {
    var i,j,k; //indices
    var pe = 0; //potential energy
   
    //zero out the forces
    for(i = 0; i < this.positions.length; i++){
	for(j = 0; j < 3; j++){
	    this.forces[i][j] = 0;
	}
    }

    var deno = 1.0 / (this.sigma * this.sigma);
    for(i = 0; i < this.positions.length; i++) {
	//for each particle
	for(k = 0; k< this.positions.length && k!==i; k++) {
	    //for each pair with the ith particle
	    var r = [0,0,0];  //initialize r vector, which is distance between particles
	    var mag_r=0 ; //The magnitude

	    for(j = 0; j < 3; j++) {

		//for each component of position

		//compute the minimum image distance.
		r[j] =this.min_image_dist(this.positions[i][j],this.positions[k][j]);
		//add to growing sq magnitude
		mag_r += r[j] * r[j];
	    }

	    //compute square root
//	    mag_r = Math.sqrt(mag_r);

	    //update pe
	    pe += 4 * this.epsilon * (Math.pow(this.sigma * this.sigma / mag_r, 6) - Math.pow(this.sigma * this.sigma / mag_r, 3))
	    //compute part of force calculation - a = 2 * (s^2 / r^2)^7 - 2 * (s^2 / r^2)^4
	    var a = 2 * Math.pow((this.sigma * this.sigma/mag_r),7)-Math.pow((this.sigma * this.sigma/mag_r),4);
	    for(j = 0; j < 3; j++) {
		//compute per component force - -24 r_j e * a / s^2
		var tmp = 24*(r[j])*this.epsilon * a * deno;
    	    	this.forces[i][j] += tmp;
		this.forces[k][j] -= tmp;
		
		
	    }
	}
    }
    
    return pe;
}
Sim.prototype.integrate=function(timestep){

    var ke=0;
    var pe=0
    var i,j;

   
  
    // Calculation of total energy
    // var i,j,k;
    
  
  /*  var deno=Math.pow((this.sigma),2);    
    for(i = 0; i < this.positions.length; i++) {
	
	
	for(k = 0; k< this.positions.length && k !== i; k++) {	
	  var r = [0,0,0];
	  var mag_r = 0;
	    for(j = 0; j < 3; j++) {
		var d= this.wrap(this.positions[i][j]);
		var b=this.wrap(this.positions[k][j]);

		r[j] =this.min_image_dist(b,d);
		mag_r += r[j] * r[j];
	    }
	    mag_r = Math.sqrt(mag_r);	    
	    PE += 4*this.epsilon*(Math.pow((this.sigma/mag_r),12)-Math.pow((this.sigma/mag_r),6));
	    
	    }
    
	var vel=0;
	for(j = 0; j < 3; j++) {
	
	    vel += Math.pow(this.velocities[i][j],2);
	}
	
	KE += 0.5*this.m*vel;
    }
        // var TE = KE+PE;
    var te = (ke + this.pe);
    console.log(this.pe)
    update_plot(te,this.energy_chart);*/
    //integrator
    
   

    for(i = 0; i <  this.positions.length; i++) {
	for(j = 0; j < 3; j++) {
	    this.velocities[i][j]+=(0.5*timestep*this.forces[i][j]/this.m);
	    this.positions[i][j]+=(0.5*timestep*this.velocities[i][j]);
	    this.positions[i][j]=this.wrap(this.positions[i][j]);
	}	    	    	       
    }
    pe = this.calculate_forces();
    
   
    for(i = 0; i <  this.positions.length; i++) {
	
	for(j = 0; j < 3; j++) {
	   
	    this.velocities[i][j] += 0.5*timestep*this.forces[i][j]/this.m;
	    ke+= 0.5*this.m*(Math.pow((this.velocities[i][j]), 2));
	  
	}	    	    	       
    }

    var te = (ke + pe);
    var t = 2.0*ke/(3.0*this.positions.length * this.kb);    

    for(i = 0; i <  this.positions.length; i++) {
	
	for(j = 0; j < 3; j++) {	    
	    this.velocities[i][j] *= this.T / t;
	}	    	    	       
    }

    this.time += timestep;
    this.steps++;

    if(this.steps % 100 === 0)
	update_plot(te,ke,pe,t,this.energy_chart, this.temperature_chart);
}

