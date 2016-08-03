//JSMD-Main.js

function main() {

    var root = document.getElementById( 'JSMD' );

    var elements = [new Sim([7,7,1],window.innerWidth/2.0, window.innerHeight/2.0, 2),
		    new Sim([7,7,1], window.innerWidth/2.0, window.innerHeight/2.0, 2),
        new Sim([7,7,1],window.innerWidth/2.0, window.innerHeight/2.0, 2),
		   ];

   elements[0].set_positions(square_lattice([7,7,1], 1, 0.5));
   elements[1].set_positions(square_lattice([7,7,1], 1.0, 0.5));
   elements[2].set_positions(square_lattice([7,7,1], 1.0, 0.5));


    elements[0].T = 0.1;
    elements[1].T = 0.4;
    elements[2].T = 1.1;



    var newscenelist = new SceneList(elements, root);
    newscenelist.animate();


document.getElementById('pause').onclick = function() {
 elements[0].toggle_pause();
   elements[1].toggle_pause();
   elements[2].toggle_pause();
  };

}
