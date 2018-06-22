var THREE = require('three')

//Set scene and three objects  
export var scene = new THREE.Scene();

export var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
           camera.position.set(1,1,500);

export var renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio)
            document.body.appendChild(renderer.domElement); //I WOULD RETURN renderer.domElement in this method!
var light = new THREE.HemisphereLight('#fff', '#666', 1.5);
        light.position.set(0, 1000, 0);
        scene.add(light);

window.addEventListener('resize', onWindowResize, false)  

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}