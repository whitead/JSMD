//JSMD-Scene.js

function Scene(element, root, T, renderer,ortho, controls, fov) {

    var content = document.getElementById( "content" );
    var template = document.getElementById( "template" ).text;

    this.element = element;
    this.root = root;
    this.renderer = renderer;

    //Make a list element
    var divelement = document.createElement( "div" );
    divelement.className = "list-element";
    divelement.innerHTML = template.replace( '$', T );

    this.divelement = divelement;
    content.appendChild( this.divelement );

    //look up the area that we want to render
    this.divelementscene=this.divelement.querySelector( ".scene" );

    ortho = ortho || false;
    controls = controls || true;
    fov = fov || 75;

	 this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);


    if(controls) {
	 this.controls = new THREE.OrbitControls( this.camera, this.divelementscene );
	 this.controls.damping = 0.2;
   this.controls.enablePan = false;
	 //this.controls.addEventListener( 'change', this.render.bind(this) );
    }

    this.camera.position.z = Math.min(this.root.clientWidth, this.root.clientHeight);
    this.scene = new THREE.Scene();
    var scene = this.scene;

    //this.root.appendChild( renderer.domElement );
    //window.addEventListener( 'resize', this.onWindowResize.bind(this), false );


    element.init_render(scene);

}
