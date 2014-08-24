function main() {
    
    var root = document.getElementById( 'JSMD' );
    
    var elements = [new Sim([5,5,5], window.innerWidth, window.innerHeight)];
    elements[0].set_positions(square_lattice([5,5,5], [1,1,1], -2));
    var scene = new Scene(elements, root);
    scene.animate();

}
