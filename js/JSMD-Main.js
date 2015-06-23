function main() {
    
    var root = document.getElementById( 'JSMD' );
    
    var elements = [new Sim([7,7,7], window.innerWidth, window.innerHeight)];
    elements[0].set_positions(square_lattice([7,7,7], [1,1,1],[1,1,1]));
    var scene = new Scene(elements, root);    
    scene.animate();

    //this will draw the 0th particle's neighbors
    var nd =  new NeighborDrawer(elements[0], scene, 0);

    //bind the pause button
    document.getElementById('pause').onclick = function() {
	elements[0].toggle_pause();
    };
}
