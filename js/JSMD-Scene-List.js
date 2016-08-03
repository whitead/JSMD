//JSMD-Scene-List.js

function SceneList (elements, root) {
  this.elements = elements;
  this.root = root;

  this.renderer = new THREE.WebGLRenderer( { clearAlpha: 1, antialias: true } );

  //set the autoclear to false, otherwise the previous scene will be cleared when you render a new scene
  this.renderer.autoClear = false;
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( root.clientWidth, root.clientHeight );
  this.renderer.setClearColor( 0xFFFFFF, 1 );

  //make an empty stack
  this.scenelist = [];

  var temperture = [0.1, 0.4, 1.1];

  for ( var i =  0; i < 3; i ++ ) {
    var T = temperture[i];
    var newelement = elements[i];
    var renderer = this.renderer
    var newscene = new Scene(newelement, root, T, renderer,true);

    //add newscene to the stack
    this.scenelist.push(newscene);
  }
}

SceneList.prototype.animate = function () {
  requestAnimationFrame(this.animate.bind(this));
  this.render();
};

SceneList.prototype.render =function () {
  this.renderer.clear();
  this.scenelist.forEach(function(newscene){

    newscene.element.animate();

    //get thte position of the div element
    var rect = newscene.divelementscene.getBoundingClientRect();

    //set the size of the viewport and cut off the part we don't want to render
    var width  = rect.right - rect.left;
    var height = rect.bottom - rect.top;
    var left   = rect.left;
    var bottom = newscene.renderer.domElement.clientHeight - rect.bottom;

    newscene.renderer.setViewport( left, bottom, width, height );
		newscene.renderer.setScissor( left, bottom, width, height);


    newscene.root.appendChild( newscene.renderer.domElement );


    newscene.renderer.clearDepth();
    newscene.renderer.render(newscene.scene,newscene.camera);
  });
}
