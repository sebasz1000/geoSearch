import { debounce } from './utils';
var THREE = require('three')

var mouseVector = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

  
export function setEvents(camera, item, type, wait) {
  
    let listener = function(e) {
      
    mouseVector.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouseVector.y = - ( e.clientY / window.innerHeight ) * 2 + 1;   
   
    
    camera.localToWorld(raycaster.ray.origin)
    raycaster.setFromCamera( mouseVector, camera );
    let target = raycaster.intersectObject(item); //on raycasting several object use intersectObjects() instead
    
    if (target && typeof target[0] !== 'undefined') {
      target[0].type = type;
      target[0].object.dispatchEvent(target[0]);
    }

  };

  if (!wait) {
    document.addEventListener(type, listener, false);
  } else {
    document.addEventListener(type, debounce(listener, wait), false);
  }
  
}
