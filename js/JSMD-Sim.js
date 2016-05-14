//JSMD-Sim.js

/*
* box_dim : a THREE.Vector3 specifying the box dimension 
* viewwidth: How wide to make the viewable width
* viewheight: How wide to make the viewable width
* dimension: integer 
* seed: random number seed
*/

var dim_names = ['x', 'y', 'z']

function Sim(box_dim, viewwidth, viewheight, dimension, seed) {
    
    //longest diagonal
    var max = 0;
    box_dim.forEach(function(x) {max = Math.max(max, x)});
    var resolution = Math.min(viewwidth, viewheight) / (max * Math.sqrt(3))

    this.resolution = resolution;
    this.box_dim = new THREE.Vector3(box_dim[0], box_dim[1], box_dim[2]);
    this.transform = new THREE.Matrix4();
    this.transform.makeScale(resolution, resolution, resolution);
    this.transform.multiply(new THREE.Matrix4().makeTranslation(-box_dim[0] / 2, -box_dim[1] / 2, -box_dim[2] / 2));

    this.dimension = dimension || 3;
    this.seed = seed || 1;

    //setup time
    this.clock = new THREE.Clock();
    this.time = 0;
    this.steps = 0;
    this.timestep = 0.02
    this.pause = false;

    this.scene = null;    

    //set-up listeners
    this.update_listeners = [];
    this.extra_meshes = []

    //set-up simulation stuff
    this.m=1;
    this.epsilon=1;
    
    this.kb=1;
    this.T=1.0; //add get command for slider here, make this default temp
    this.particle_radius = 1.5 * resolution;

    this.do_plots = false;


    //default to not do neighborlists
    this.do_neighborlist = false;
    this.r_cut_sq = 0.001;
    this.r_skin = 0.001;   

    this.pair_force = null;
    this.field_force = null;
    

}

/*
* Start plotting
*/
Sim.prototype.start_plotting = function(id_prefix, light_background) {
    this.do_plots = true;

    id_prefix = id_prefix || "";
    light_background = light_background || false;
    
    var a = create_plots(id_prefix, light_background);
    this.energy_chart = a[0];
    this.temperature_chart = a[1];
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
    if(this.scene !== null)
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

    //if we don't have any forces, we'll add lj forces and zeroing field force
    if(this.field_force === null && this.pair_force === null) {
	this.set_pair_force(function(r, r2, tmp, dim) {
	    return lj_pair_force(r, r2, tmp, dim, 0.5, 1.0);
	}, 1.5, 2.0);
    }

    if(this.field_force === null) {
	//by default, it's a zeroing
	this.set_field_force(function(r, f, dim) {
	    for(var i; i < dim; i++)
		f[i] = 0;
	    return 0;
	});
    }
	
    
    this.empty_neighbor();//empty neighbors list
    this.update_neighborlist();//update the list


    //draw simulation box
    if(this.dimension < 3) {
	
	var shape = new THREE.Shape();
	shape.moveTo( 0,0);
	shape.lineTo( 0, this.box_dim.y );
	shape.lineTo( this.box_dim.x, this.box_dim.y );
	shape.lineTo( this.box_dim.x,0 );
	shape.lineTo( 0, 0);	
	shape.autoClose =  true;
	var line = new THREE.Line( shape.createPointsGeometry(),
				   new THREE.LineBasicMaterial( {
				       color: 0x777777, linewidth: 3
				   } ) );
	line.applyMatrix(this.transform);
	scene.add(line);
    }
    else if(this.dimension === 3){
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
	if(this.dimension < 3)
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
	var nd = new NormalDistribution(sig,0, this.seed); 
	for(i = 0; i < this.positions.length; i++) {
	    var v = [0,0,0]
	    for(var j = 0; j < this.dimension; j++)
		v[j] = nd.sample();
	    this.velocities.push(v);
	    this.forces.push([0, 0, 0]);
	}
    }
    
    this.scene = scene;

    //making sure meshes were added
    this.extra_meshes.map(function(m){scene.add(m);});
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
	var v = new THREE.Vector3();
	var a = [0,0,0];
	var letter;
	for(i = 0; i < this.positions.length; i++) {
	    
	    for(j = 0; j < this.dimension; j++)
		a[j] = this.wrap(this.positions[i][j], j);
	    //special case, if doing pe
	    if(this.dimension === 1)
		a[1] = this.positions[i][1];
	    v.fromArray(a);
	    v.applyMatrix4(this.transform);
	    this.particles.geom.vertices[i].copy(v);
	}
	this.particles.geom.verticesNeedUpdate = true;
    }
    /* TODO: At some point deal with dynamic meshes
    for(i = 0; i < this.extra_meshes.length; i++) {
	this.extra_meshes[i].position.applyMatrix4(this.transform);
    }
    */

}
Sim.prototype.update = function() {
    /*
    //treat timing
    var delta = this.clock.getDelta();
    //target is 60 fps
    var timestep = this.timestep;
    if(1.0 / delta > 60) {
	timestep *= 60 * delta	
    }    
    //this is the actual simulation	
    this.integrate(timestep);
    */
     this.integrate(this.timestep);
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

    if(!this.do_neighborlist)
	return;
    
    var i, j, k;
   
    for(i=0; i<this.positions.length; i++){//loops for the length of the rows of the neighbor's list
	var l=0;
	for (k=i + 1; k<this.positions.length ; k++){//loops for the length of the columns of the neighbor's list
 	    //var m=0;
	    var differ=[0,0,0];
	    var differ_sq=0;
	    for(j=0; j<this.dimension; j++){
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
    var tmp = [0,0,0]; //force vector
   
    //zero out the forces and calculate force_filed if necessary
    for(i = 0; i < this.forces.length; i++){
	pe += this.field_force(this.positions[i], tmp, this.dimension);
	for(j = 0; j < this.dimension; j++){
	    this.forces[i][j] = tmp[j];
	}
    }
    if(this.do_neighborlist) {    
	for(i = 0; i < this.neighbor_array.length; i++) {	
	    //for each particle do pair calculations
	    for(k = 0; k< this.neighbor_array[i].length; k++) {
		if(this.neighbor_array[i][k]===-1){
		    break;}
		//for each pair with the ith particle
		var r = [0,0,0];  //initialize r vector, which is distance between particles
		
		var small_r=0 ;
		var mag_r=0 ; //The magnitude
		
		for(j = 0; j < this.dimension; j++) {
		    
		    //for each component of position
		    
		    //compute the minimum image distance.
		    //console.log(this.neighbor_array[i][k])
		    r[j] =this.min_image_dist(this.positions[i][j],this.positions[this.neighbor_array[i][k]][j], j);
		    //add to growing sq magnitude
		    mag_r += r[j] * r[j];
		}
		if (mag_r<=this.r_cut_sq){		
		    //call pairwise force-function
		    //update pe too
		    pe += this.pair_force(r, mag_r, tmp, this.dimension);
		    for(j = 0; j < this.dimension; j++) {
			//compute per component force - -24 r_j e * a / s^2
    	    		this.forces[i][j] += tmp[j];
			this.forces[this.neighbor_array[i][k]][j] -= tmp[j];
		    }
		}
	    }		
	}
    }    
    return pe;
}

Sim.prototype.set_pair_force = function(fxn, r_cut, r_skin) {
    
    this.do_neighborlist = true;

    //neighbor list stuff
    this.r_cut_sq= r_cut;
    this.r_skin= r_skin;
    this.r_cut *= this.r_cut;    
    this.r_skin *= this.r_skin;

    this.pair_force = fxn;

}

Sim.prototype.set_field_force = function(fxn, draw_field) {
    this.field_force = fxn;
    draw_field = draw_field || false;
    
    if(draw_field && this.dimension === 1){
	var nbins = 100.0;
	var points = [];
	var x, pe, min = 10000, max = -10000;
	for(var i =0; i < nbins; i++){
	    
	    x = 0 + i * this.box_dim.x  /(nbins - 1);	    
	    pe = fxn([x],[0],1);
	    min = Math.min(pe,min);
	    max = Math.max(pe,max);	    
	    points.push(new THREE.Vector2(x,pe));
	}
	

	var s = this.box_dim.y/(max - min);
	var t = new THREE.Matrix4()
	t.set(1,0,0,0,0,s,0, -min * s,0,0,1,0,0,0,0,1 );


	var pmf_curve = new THREE.Path(points);
	
	var pmf_geom = pmf_curve.createPointsGeometry(nbins);
	pmf_geom.applyMatrix(t);
	var pmf_material = new THREE.LineBasicMaterial({ color : 0xEE2299, linewidth : 3});

	var o = new THREE.Line(pmf_geom, pmf_material);	

	o.applyMatrix(this.transform);
	this.add_mesh(o);

	//store that PE to position transform
	this.pe2pos = t;
    }
}

Sim.prototype.pair_force = lj_pair_force; 

Sim.prototype.integrate=function(timestep){


    var ke=0;
    var pe=0;
    var i,j;
    
    //integrator
    if(!this.pause) {
	for(i = 0; i <  this.positions.length; i++) {
	    for(j = 0; j < this.dimension; j++) {
		this.velocities[i][j]+=(0.5*timestep*this.forces[i][j]/this.m);
		this.positions[i][j]+=(0.5*timestep*this.velocities[i][j]);
		this.positions[i][j]=this.wrap(this.positions[i][j], j);
	    }	    	    	       
	}
    }
    pe = this.calculate_forces();
    
    for(i = 0; i <  this.positions.length; i++) {
	
	for(j = 0; j < this.dimension; j++) {
	    if(!this.pause)
		this.velocities[i][j] += 0.5*timestep*this.forces[i][j]/this.m;
	    ke+= 0.5*this.m*(Math.pow((this.velocities[i][j]), 2));
	    
	}
	//if we're plotting our PE (1D, field force)
	if(this.dimension === 1 && this.field_force !== null) {
	    //create temp vector so we can apply matrix transform
	    var loc = new THREE.Vector3(0,0,0);
	    loc.x = this.positions[i][0];
	    loc.y = pe;
	    //apply it
	    loc.applyMatrix4(this.pe2pos);
	    //store result
	    this.positions[i][1] = loc.y;
	}
    }

    
    //calculates total force
    var te = (ke + pe);
    //calculates temperature from kinetic energy
    var t = 2.0*ke/(this.dimension*this.positions.length * this.kb);    

    if(!this.pause && this.T !== null) {
	for(i = 0; i <  this.positions.length; i++) {	
	    for(j = 0; j < this.dimension; j++) {	    
		this.velocities[i][j] *= this.T / t;
	    }	    	    	       
	}
	
	this.time += timestep;
	this.steps++;
    }
    
    if(this.pause || this.steps % 100 === 0){
	if(this.do_plots)
	    update_plot(te,ke,pe,t,this.energy_chart, this.temperature_chart);
    }
    
    if(!this.pause && this.steps % 10 === 0){
	this.update_neighborlist();
    }
     
}




function lj_pair_force(r, r2, tmp, dim, sigma, epsilon) {
    var deno = 1.0 / (sigma * sigma);
    var a = 2 * Math.pow((sigma * sigma/r2),7)-Math.pow((sigma * sigma/r2),4);
    for(var i = 0; i < dim; i++) {
	//compute per component force - -24 r_j e * a / s^2
	tmp[i] = 24*(r[i])*epsilon * a * deno;
    }    
    return 4 * epsilon * (Math.pow(sigma * sigma / r2, 6) - Math.pow(sigma * sigma / r2, 3))
}

function tabulate_pmf(func, boxdim, nbins) {//Call this for setup of surface
    var i;//index for pmf loop
    var table=[];
    for(i = 0; i < nbins; i++){
	table.push(func(i * (boxdim/nbins)));
    }
    return(table);
}

function parabola_field(r, f, dim) {
    f[0] = -parabola_derivative(r[0]);
    return parabola(r[0]);
}
	
    
//var pmf_table=tabulate_pmf(parabola, this.box_dim[0],100);
