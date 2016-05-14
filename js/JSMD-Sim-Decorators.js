//JSMD-Sim-Decorators.js

function NeighborDrawer(sim, scene, index) {
    
    this.index = index;

    var m = new THREE.MeshBasicMaterial( { wireframe: true, wireframeLineWidth: 0, color:0x44EE22} );
    this.neighbor_material = new THREE.MeshBasicMaterial( { wireframe: true, wireframeLineWidth: 0, color:0xFF00EF} );

    
    this.sphere_geom = new THREE.SphereGeometry(sim.particle_radius * 0.3, 12, 12);
    this.origin_sphere = new THREE.Mesh(this.sphere_geom, m);
    this.origin_index = sim.add_mesh(this.origin_sphere);
    this.neighbor_meshes = [];
    
    //create closure and register
    var that = this;
    sim.add_update_listener(this);
}

NeighborDrawer.prototype.set_index = function(index) {
    this.index = index;
}

NeighborDrawer.prototype.update = function(sim) {
    var i,j;
    
    //update origin
    this.origin_sphere.position.x = sim.positions[this.index][0];
    this.origin_sphere.position.y = sim.positions[this.index][1];
    this.origin_sphere.position.z = sim.positions[this.index][2];
    
    
    //update neighbors
    for(i = 0; i < this.neighbor_meshes.length; i++) {
	//have we reached the end?
	if(sim.neighbor_array[this.index][i] === -1) {
	    //if so, remove the extra meshes we have
	    for(j = 0; j < (this.neighbor_meshes.length - i); j++) {	
		sim.remove_mesh(this.neighbor_meshes.pop());
	    }
	    break;
	}
	this.neighbor_meshes[i].position.x = sim.positions[sim.neighbor_array[this.index][i]][0];
	this.neighbor_meshes[i].position.y = sim.positions[sim.neighbor_array[this.index][i]][1];
	this.neighbor_meshes[i].position.z = sim.positions[sim.neighbor_array[this.index][i]][2];
    }
    
    //did we not have enough meshes for neighbors??
    while(sim.neighbor_array[this.index][i] !== -1) {
	//create a new mesh
	var m = new THREE.Mesh(this.sphere_geom, this.neighbor_material);
	
	//update the positions
	m.position.x = sim.positions[sim.neighbor_array[this.index][i]][0];
	m.position.y = sim.positions[sim.neighbor_array[this.index][i]][1];
	m.position.z = sim.positions[sim.neighbor_array[this.index][i]][2];
	
	
	//add it to both the simulation and us
	this.neighbor_meshes.push(m)
	sim.add_mesh(m);
	
	i += 1;
    }
}
