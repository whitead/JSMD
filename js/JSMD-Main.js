function main() {
    

    var root = document.getElementById( 'JSMD' );
    
    var elements = [new Sim([7,7,1], window.innerWidth, window.innerHeight, 2, 10),
		    new Sim([7,7,1], window.innerWidth, window.innerHeight, 2, 10),
		   ];
    
    elements[0].set_positions(square_lattice([3,3,1], 1, 0.5));    
    elements[1].set_positions(square_lattice([3,3,1], 1.0, 0.5));


    var m = new THREE.Matrix4()
    m.makeTranslation(window.innerWidth / 6, 0, 0);
    elements[0].transform.premultiply(m);

    //flip it for fun?
    m.makeTranslation(-window.innerWidth / 6, 0, 0);    
    elements[1].transform.premultiply(m);

    watch_com(elements[0]);

    
    var scene = new Scene(elements, root, true);    
    scene.animate();
    
    //bind the pause button
    document.getElementById('pause').onclick = function() {
	elements[0].toggle_pause();
    };
}
