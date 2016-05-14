function main() {
    

    var root = document.getElementById( 'JSMD' );


    var elements = [new Sim([7,7,1], window.innerWidth/2., window.innerHeight/2., 2, 10),
		    new Sim([7,7,1], window.innerWidth/2., window.innerHeight/2., 2, 10),
            new Sim([7,7,1], window.innerWidth/2., window.innerHeight/2., 2, 10),
		   ];
  
    elements[0].set_positions(square_lattice([7,7,1], 1, 0.5));    
    elements[1].set_positions(square_lattice([7,7,1], 1.0, 0.5));
    elements[2].set_positions(square_lattice([7,7,1], 1.0, 0.5));

    elements[0].T = .1;
    elements[1].T = .4;
    elements[2].T = 1.1;

    var m = new THREE.Matrix4()
    m.makeTranslation(window.innerWidth / 6, 0, 0);
    elements[0].transform.premultiply(m);

    //flip it for fun?
    m.makeTranslation(-window.innerWidth / 6, 0, 0);    
    elements[1].transform.premultiply(m);

    
    var scene = new Scene(elements, root, true);    
    scene.animate();
    
    //bind the pause button
    document.getElementById('pause').onclick = function() {
	   elements[0].toggle_pause();
       elements[1].toggle_pause();
       elements[2].toggle_pause();

    };
};