//JSMD-Main.js

function main() {
    

    var root = document.getElementById( 'JSMD' );

    var elements = [new Sim([7,7,1], window.innerWidth/2.0, window.innerHeight/2.0, 2),
		    new Sim([7,7,1], window.innerWidth/2.0, window.innerHeight/2.0, 2),
            new Sim([7,7,1], window.innerWidth/2.0, window.innerHeight/2.0, 2),
		   ];
  
    elements[0].set_positions(square_lattice([7,7,1], 1, 0.5));    
    elements[1].set_positions(square_lattice([7,7,1], 1.0, 0.5));
    elements[2].set_positions(square_lattice([7,7,1], 1.0, 0.5));

    elements[0].T = 0.1;
    elements[1].T = 0.4;
    elements[2].T = 1.1;

    var m = new THREE.Matrix4();
    m.makeTranslation(window.innerWidth / 6, 0, 0);
    elements[2].transform.premultiply(m);

    m = new THREE.Matrix4();
    m.makeTranslation(-window.innerWidth / 6, 0, 0);
    elements[0].transform.premultiply(m);


 /*   
    var elements = [new Sim([2.5,1,0], window.innerWidth, window.innerHeight, 1, 10),
		   // new Sim([7,1,1], window.innerWidth, window.innerHeight, 2, 10),
		   ];
    
    elements[0].set_positions(square_lattice([1,1,1], 1, 2.49));
    elements[0].set_field_force(parabola_field, true);
    elements[0].T = null;
    //elements[1].set_positions(square_lattice([7,1,1], 1.0, 0.5));
   

    var m = new THREE.Matrix4();
    //m.makeTranslation(window.innerWidth / 16, 0, 0);
    elements[0].transform.premultiply(m);

    //flip it for fun?
    //m.makeTranslation(-window.innerWidth / 6, 0, 0);    
    //elements[1].transform.premulthiply(m);

    watch_com(elements[0]);

 */   
    var scene = new Scene(elements, root, true, false, true);    
    scene.animate();
    
    //bind the pause button
    //document.getElementById('pause').onclick = function() {
//	   elements[0].toggle_pause();
//       elements[1].toggle_pause();
//       elements[2].toggle_pause();

//    };
}
