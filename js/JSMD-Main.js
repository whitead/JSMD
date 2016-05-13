function main() {
    
    var root = document.getElementById( 'JSMD' );
    
    var elements = [new Sim([15,15,1], window.innerWidth, window.innerHeight, true)];
    elements[0].set_positions(square_lattice([15,15,1], [1,1,1],[1,1,1]));
    var scene = new Scene(elements, root, true);    
    scene.animate();

    //this will draw the 0th particle's neighbors
    //var nd =  new NeighborDrawer(elements[0], scene, 0);

    //bind the pause button
    document.getElementById('pause').onclick = function() {
	elements[0].toggle_pause();
    };
}
