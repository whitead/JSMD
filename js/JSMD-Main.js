'use strict';

function main() {
    
    var elements = [new Sim(new THREE.Vector3(5,5,5), 1)];
    var scene = new Scene(elements);
    scene.animate();

}
