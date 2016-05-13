
/*
* box_dim : a THREE.Vector3 specifying the box dimension 
* viewwidth: How wide to make the viewable width
* viewheight: How wide to make the viewable width
*/

var dim_names = ['x', 'y', 'z']

function Sim(box_dim, viewwidth, viewheight, two_dimension) {
    
    //longest diagonal
    var max = 0;
    box_dim.forEach(function(x) {max = Math.max(max, x)});
    var resolution = Math.min(viewwidth, viewheight) / (max * Math.sqrt(3))

    this.resolution = resolution;
    this.box_dim = new THREE.Vector3(box_dim[0], box_dim[1], box_dim[2]);
    this.transform = new THREE.Matrix4();
    this.transform.makeScale(resolution, resolution, resolution);
    this.two_dimension = two_dimension || false;

    //setup time
    this.clock = new THREE.Clock();
    this.time = 0;
    this.steps = 0;
    this.timestep = 0.02
    this.pause = true;

    this.scene = null;

    //set-up listeners
    this.update_listeners = [];
    this.extra_meshes = []

    //set-up simulation stuff
    this.m=1;
    this.epsilon=1;
    
    this.sigma=0.5;//put a slider here to adjust sigma value, see more/less neighbors
    this.kb=1;
    this.T=1.1; //add get command for slider here, make this default temp
    this.particle_radius = this.sigma * 150;
    
    //For the plots
    var a = createTimeline();
    this.energy_chart = a[0];
    this.temperature_chart = a[1];

//    this.r_cut_sq=Math.pow(2.0*this.sigma, 2);//radius of the cut off range
    //    this.r_skin=Math.pow(2.5*this.sigma, 2);//radius of the skin
//    this.r_cut_sq=Math.pow(3.0*this.sigma, 2);//radius of the cut off range
//    this.r_skin=Math.pow(3.5*this.sigma, 2);//radius of the skin
    this.r_cut_sq=Math.pow(6.0*this.sigma, 2);//radius of the cut off range
    this.r_skin=Math.pow(7.0*this.sigma, 2);//radius of the skin


}

/*
* Add an object whose update method will be called on each simulation update
*/
Sim.prototype.add_update_listener = function(x) {
    this.update_listeners.push(x);
}

/*
 * Add a mesh whose position will be updated to be correctly wrapped
 * and displayed in simulation coordinates
 */
Sim.prototype.add_mesh = function(m) {
    this.scene.add(m);
    this.extra_meshes.push(m);
    
}

Sim.prototype.toggle_pause = function() {
    this.pause = !this.pause;
}

/*
* Remove a mesh added by add_mesh(). The argument is the mesh that
* was returned when add_mesh was called.
*/
Sim.prototype.remove_mesh = function(m) {
    var index = this.extra_meshes.indexOf(m);
    this.scene.remove(this.extra_meshes[index]);
    this.extra_meshes.splice(index, 1);
}


Sim.prototype.set_positions = function(positions) {
    this.positions = positions;    
}


Sim.prototype.init_render = function(scene) {
    this.empty_neighbor();//empty neighbors list
    this.update_neighborlist();//update the list

    //draw simulation box
    if(this.two_dimension) {
	
	var shape = new THREE.Shape();
	shape.moveTo( -this.box_dim.x/2, -this.box_dim.y / 2 );
	shape.lineTo( -this.box_dim.x/2, this.box_dim.y/2 );
	shape.lineTo( this.box_dim.x/2, this.box_dim.y/2 );
	shape.lineTo( this.box_dim.x/2, -this.box_dim.y /2 );
//	shape.lineTo( 0, 0 );
	shape.autoClose =  true;
	var line = new THREE.Line( shape.createPointsGeometry(),
				   new THREE.LineBasicMaterial( {
				       color: 0x777777, linewidth: 3
				   } ) );
	line.applyMatrix(this.transform);
	scene.add(line);
    }
    else{
	var geomDim = this.box_dim.clone().applyMatrix4(this.transform);
	this.box = { 
	    'geom': new THREE.BoxGeometry(geomDim.x, geomDim.y, geomDim.z),
	    'material': new THREE.MeshBasicMaterial({
		color:  0xff0000,
		wireframe: true
	    })};
	this.box.mesh = new THREE.Mesh(this.box.geom, this.box.material);
	scene.add(this.box.mesh);	
    }



    //if we have positions, then we render them
    if('undefined' !== typeof this.positions) {
	//create the geometric
	this.particles = {
	    'geom': new THREE.Geometry(),
	}
	//create the particle, set it transparent (so we can see through the png transparency) and color it
	this.particles.mat = new THREE.PointsMaterial( { size: this.particle_radius, sizeAttenuation: true, transparent: true, alphaTest: 0.5 } );
	this.particles.mat.color.setHSL( 1.0, 0.4, 0.5 );
	//this.particles.mat.blending =  THREE.AdditiveBlending;

	
	var loader = new THREE.TextureLoader();
	var _this = this;
	var url = 'assets/textures/ball.png';
	if(this.two_dimension)
	    url = 'assets/textures/disc.png';
	
	loader.load(url, function(x) {
	    
	    _this.particles.sprite = x;
	    _this.particles.mat.map = x;

	    //actually add the particles to the scene now
	    //Store the geometry with the particles and make sure our sorting matches
	    _this.particles.cloud = new THREE.Points(_this.particles.geom, _this.particles.mat);
	    _this.particles.sortParticles = true;
	    scene.add(_this.particles.cloud);	    
	});
	

	//now, we place vertices at each of the positions
	for(var i = 0; i < this.positions.length; i++) {
	    var vertex = new THREE.Vector3(this.resolution * this.positions[i][0], this.resolution * this.positions[i][1], this.resolution * this.positions[i][2]);
	    this.particles.geom.vertices.push(vertex);	    
	}

	//Creaete some velocities and positions
	this.velocities = [];
	this.forces = [];
	//Creating normally distributed x,y and z velocities
	var sig= Math.sqrt(this.kb*this.T/this.m);
	var nd = new NormalDistribution(sig,0); 
	for(i = 0; i < this.positions.length; i++) {
	    if(this.two_dimension)
		this.velocities.push([nd.sample(), nd.sample(), 0]);
	    else
		this.velocities.push([nd.sample(), nd.sample(), nd.sample()]);
	    this.forces.push([0, 0, 0]);
	}
    }
    
    this.scene = scene;
};
 
 

//this is the main loop
Sim.prototype.animate = function() {
    this.update();
    //treat listeners
    var that = this
    for(var i = 0; i < this.update_listeners.length; i++)	
	this.update_listeners[i].update(that);

    this.render();

}

function rounded(number){
    if(number<0){
        return (Math.ceil(number-0.5));// rounds a number to the nearest digit
    }
    else{
        return (Math.floor(number+0.5));
    }
}
Sim.prototype.min_image_dist=function(x1,x2, dim){//calculates the minimum image distance between two positions
    var change=x1-x2;
    return ((change -rounded(change/this.box_dim[dim_names[dim]])*this.box_dim[dim_names[dim]]) );

}
Sim.prototype.wrap=function(x, dim){//puts a particle inside the box
    return (x-Math.floor(x/this.box_dim[dim_names[dim]])*this.box_dim[dim_names[dim]]);
}


Sim.prototype.render = function() {
    //this is where the rendering takes place
    var i, j;
    
    if(this.particles) {
	for(i = 0; i < this.positions.length; i++) {
	    this.particles.geom.vertices[i].x = this.resolution * (this.wrap(this.positions[i][0], 0) - this.box_dim.x / 2);								 
	    this.particles.geom.vertices[i].y = this.resolution * (this.wrap(this.positions[i][1], 1) - this.box_dim.y / 2);
	    this.particles.geom.vertices[i].z = this.resolution * (this.wrap(this.positions[i][2], 2) - this.box_dim.z / 2);
	}
	this.particles.geom.verticesNeedUpdate = true;
    }

    for(i = 0; i < this.extra_meshes.length; i++) {
	this.extra_meshes[i].position.x = this.resolution * (this.wrap(this.extra_meshes[i].position.x, 0) - this.box_dim.x / 2);
	this.extra_meshes[i].position.y = this.resolution * (this.wrap(this.extra_meshes[i].position.y, 1) - this.box_dim.y / 2);
	this.extra_meshes[i].position.z = this.resolution * (this.wrap(this.extra_meshes[i].position.z, 2) - this.box_dim.z / 2);
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

/*Creating neighbor list*/
Sim.prototype.empty_neighbor=function(){
    var i;
    this.neighbor_array=new Array(this.positions.length);//creates a 1 D array of length of the positions
    for (i=0; i<this.positions.length; i++){
	this.neighbor_array[i]=new Array(this.positions.length);//creates NxN array 
    } 
    return this.neighbor_array;
}
 
/*Updating the neighbor's list for atoms within the skin of the particle*/
Sim.prototype.update_neighborlist=function(){
    var i, j, k;
   
    for(i=0; i<this.positions.length; i++){//loops for the length of the rows of the neighbor's list
	var l=0;
	for (k=i + 1; k<this.positions.length ; k++){//loops for the length of the columns of the neighbor's list
 	    //var m=0;
	    var differ=[0,0,0];
	    var differ_sq=0;
	    for(j=0; j<3; j++){
		differ[j]=this.min_image_dist(this.positions[i][j],this.positions[k][j], j);//calculates the minimum image distance
		differ_sq+=differ[j]*differ[j];//calculates the magnitude of diffrence in three dimensions
	    }
	 
	    if(differ_sq<=this.r_skin){//checks whether distance between particles is smaller than the skin
		this.neighbor_array[i][l]=k;//populates the neighbor's list with the actual particles.
		l+=1;//keeps track of atoms that are inside the neighbor's list
	    }
	}
	this.neighbor_array[i][l]=-1;//if a particle is outside of the skin, then we put -1 to represent that it is outside of the box
    }
    return this.neighbor_array;//returns the neihgbor's list
}




/*
* This calculates the LJ force on each particle, updates the forces
* array and computes total potential energy.
*/

Sim.prototype.calculate_forces=function() {
    var i,j,k; //indices
    var pe = 0; //potential energy
   
    //zero out the forces
    for(i = 0; i < this.forces.length; i++){
	for(j = 0; j < 3; j++){
	    this.forces[i][j] = 0;
	}
    }
    
    var deno = 1.0 / (this.sigma * this.sigma);
    for(i = 0; i < this.neighbor_array.length; i++) {
	//for each particle
	for(k = 0; k< this.neighbor_array[i].length; k++) {
	    if(this.neighbor_array[i][k]===-1){
		break;}
	    //for each pair with the ith particle
	    var r = [0,0,0];  //initialize r vector, which is distance between particles
	    
	    var small_r=0 ;
	    var mag_r=0 ; //The magnitude

	    for(j = 0; j < 3; j++) {

		//for each component of position

		//compute the minimum image distance.
		//console.log(this.neighbor_array[i][k])
		r[j] =this.min_image_dist(this.positions[i][j],this.positions[this.neighbor_array[i][k]][j], j);
		//add to growing sq magnitude
		mag_r += r[j] * r[j];
	    }
	    if (mag_r<=this.r_cut_sq){
		
		//update pe
		pe += 4 * this.epsilon * (Math.pow(this.sigma * this.sigma / mag_r, 6) - Math.pow(this.sigma * this.sigma / mag_r, 3))
		//compute part of force calculation - a = 2 * (s^2 / r^2)^7 - 2 * (s^2 / r^2)^4
		var a = 2 * Math.pow((this.sigma * this.sigma/mag_r),7)-Math.pow((this.sigma * this.sigma/mag_r),4);
		for(j = 0; j < 3; j++) {
		    //compute per component force - -24 r_j e * a / s^2
		    var tmp = 24*(r[j])*this.epsilon * a * deno;
    	    	    this.forces[i][j] += tmp;
		    this.forces[this.neighbor_array[i][k]][j] -= tmp;
		}
	    }
	}
	
	
    }
    
    return pe;
}

Sim.prototype.integrate=function(timestep){


    var ke=0;
    var pe=0;
    var i,j;
    
    //integrator
    if(!this.pause) {
	for(i = 0; i <  this.positions.length; i++) {
	    for(j = 0; j < 3; j++) {
		this.velocities[i][j]+=(0.5*timestep*this.forces[i][j]/this.m);
		this.positions[i][j]+=(0.5*timestep*this.velocities[i][j]);
		this.positions[i][j]=this.wrap(this.positions[i][j], j);
	    }	    	    	       
	}
    }
    pe = this.calculate_forces();
    
    for(i = 0; i <  this.positions.length; i++) {
	
	for(j = 0; j < 3; j++) {
	    if(!this.pause)
		this.velocities[i][j] += 0.5*timestep*this.forces[i][j]/this.m;
	    ke+= 0.5*this.m*(Math.pow((this.velocities[i][j]), 2));
	    
	}	    	    	       
    }

    
    //calculates total force
    var te = (ke + pe);
    //calculates temperature from kinetic energy
    var dim = 2.0 ? this.two_dimension : 3.0;
    var t = 2.0*ke/(dim*this.positions.length * this.kb);    

    if(!this.pause) {
	for(i = 0; i <  this.positions.length; i++) {	
	    for(j = 0; j < 3; j++) {	    
		this.velocities[i][j] *= this.T / t;
	    }	    	    	       
	}
	
	this.time += timestep;
	this.steps++;
    }
    
    if(this.pause || this.steps % 100 === 0){
	update_plot(te,ke,pe,t,this.energy_chart, this.temperature_chart);
    }
    
    if(!this.pause && this.steps % 10 === 0){
	this.update_neighborlist();
    }
     
}

