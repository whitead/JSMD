
/*
* box_dim : a THREE.Vector3 specifying the box dimension 
* viewwidth: How wide to make the viewable width
* viewheight: How wide to make the viewable width
* dimension: integer 
* seed: random number seed
*/

function parabola(x){
    //return((x-3)*(x-3)-1);
    x -= 0.99
    return Math.pow(Math.pow(x,2) - 1, 2) - Math.log(x + 1) / 3;
}
function parabola_derivative(x){
    x -= 0.99
    return 2 * (Math.pow(x,2) - 1) * 2 * x - 1.0 / 3 / (x + 1);
}

function sine(x){
    return(Math.sin(x));
}
