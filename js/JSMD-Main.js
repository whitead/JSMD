'use strict';

function main() {
    
    var elements = [new Sim(new THREE.Vector3(200,200,200), 1)];
    var scene = new Scene(elements);
    scene.animate();

}
