//JSMD-Main.js

function main() {
    

    var m = new MultiScene(true);
    
    var root = document.getElementById( 'JSMD-1' );
    var elements = [new Sim([3,3,3], window.innerWidth, window.innerHeight, 3)];  
    elements[0].set_positions(square_lattice([3,3,3], 1, 0.5));    
    m.add_scene(elements, root, false);    

    root = document.getElementById( 'JSMD-2' );
    elements = [new Sim([7,7,1], window.innerWidth, window.innerHeight, 2)];  
    elements[0].set_positions(square_lattice([7,7,1], 1, 0.5));
    m.add_scene(elements, root, true);        

    root = document.getElementById( 'JSMD-3' );
    elements = [new Sim([7,7,1], window.innerWidth, window.innerHeight, 1)];  
    elements[0].set_positions(square_lattice([1,1,1], 1, 2.49));
    elements[0].set_field_force(parabola_field, true);
    elements[0].T = null;
    m.add_scene(elements, root,  true);    


    m.animate();
}
