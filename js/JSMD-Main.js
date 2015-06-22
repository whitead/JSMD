function main() {
    
    var root = document.getElementById( 'JSMD' );
    
    var elements = [new Sim([10,10,10], window.innerWidth, window.innerHeight)];
    elements[0].set_positions(square_lattice([7,7,7], [10 / 7.0,10 / 7.0,10 / 7.0],[1,1,1]));
    var scene = new Scene(elements, root);    
    scene.animate();

    //this will draw the 0th particle's neighbors
    var nd =  new NeighborDrawer(elements[0], scene, 0);
}
