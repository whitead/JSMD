function main() {
    
    var root = document.getElementById( 'JSMD' );
    
    var elements = [new Sim([10,10,10], window.innerWidth, window.innerHeight)];
    elements[0].set_positions(square_lattice([10,10,10], [1,1,1],[1,1,1]));
    var scene = new Scene(elements, root);
    scene.animate();
    
}
