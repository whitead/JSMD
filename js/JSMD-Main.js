'use strict';

function main() {
    
    var elements = [new Sim(new THREE.Vector3(1,1,1), 1)];
    var scene = new Scene(elements);
    scene.animate();

}
