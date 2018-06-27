import React from 'react'
import { scene, camera, renderer } from './lib/scene';
import { convertoLatLng, convertToXYZ, geodecoder } from './lib/geoHelpers';
import mapTexturer from './lib/mapTexturer'
import { memoize } from './lib/utils';
import worlddata from './data/world.json'
var TWEEN = require('@tweenjs/tween.js');
var topojson = require('topojson')
var THREE = require('three')
var raycaster = new THREE.Raycaster()
var mouse = { x: 0, y: 0 , xdown: 0, ydown: 0, down: false, move: false }
var pickerPoint = new THREE.Vector3();

var targetRotationX = 0.5, targetRotationY = 0.2;
var windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2; 
var currentCountry, overlay, pointer;
var world = new THREE.Object3D();   // acts as an common 3d anchor point
world.name = 'World Obj'

var countries = topojson.feature(worlddata, worlddata.objects.countries)
var geo = geodecoder(countries.features);

const pointerGeometry = new THREE.SphereGeometry(1, 300, 300);
const pointerMaterial = new THREE.MeshPhongMaterial({color: 'red'});

// world settings    
var easeFactor = 0.10;  // lower it will stop later
var sphereSegments = 400; // vertices of the wireframesSphere. Higher improves mouse accuracy
var sphereRadius = 230;
var wireframeOpacity = 0.15

var wireframeMaterial = new THREE.MeshPhongMaterial({wireframe: true, transparent: true })
var wireframedMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 5 , sphereSegments, sphereSegments), 
                                        wireframeMaterial)


var initialCameraSetup = new THREE.PerspectiveCamera();


export default class Globe extends React.Component{
  
  shouldComponentUpdate(nextProps, nextState){ // this Component will never re render.
    return false;
  }
  
  componentDidMount(){
  initialCameraSetup.copy(camera)
  console.log(camera.position.x + ' ' + camera.position.y + ' ' + camera.position.z)
  } 
  
  textureCache = memoize(function (cntryID, color) {
      var country = geo.find(cntryID);
      return mapTexturer(country, color)
  });
  
  handleClick = (e) => {
        e.preventDefault();
        mouse.down = (e.buttons !== 0 ? true : false)
        e.button === 2 && this.resetCameraPosition(initialCameraSetup)
        mouse.xdown = e.clientX 
        mouse.ydown = e.clientY
       
  }
  
  handleMouseMove = (e) => {
        mouse.move = (e.type === 'mousemove' ? true : false)
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;
        if(mouse.down){ // its gragging
          targetRotationX = ( (e.clientX - windowHalfX) - (mouse.xdown - windowHalfX)) * 0.00025;
          targetRotationY = ( (e.clientY -  windowHalfY) - (mouse.ydown - windowHalfY)) * 0.00025;
        }
    }
  
  makeTweenVector = (vectorToTween, target, options) => {
    
    options = options || {} //{duration, easingType, updateCallback()}
    let to = target || THREE.Vector3(), 
        easing = options.easing || TWEEN.Easing.Quadratic.In,
        duration = options.duration || 2000
    
    var tween = new TWEEN.Tween(vectorToTween)
                          .to({ x: to.x , y: to.y, z: to.z }, duration)
                          .easing(easing) 
                          .onUpdate(function(d){ options.update && options.update(d)})
                          .onComplete(function(){console.log('Tween completed!')})
                          .start();
    return tween;
  }
  
  rotateWorld = (object,axis, radians) => { // look for arms reference to look for better rotation!
     var rotationMatrix = new THREE.Matrix4();
         rotationMatrix.makeRotationAxis( axis.normalize(), radians );
         rotationMatrix.multiply( object.matrix );                       
      object.matrix = rotationMatrix;
      object.rotation.setFromRotationMatrix( object.matrix );
  }
  
  resetCameraPosition = (initCamera) => {
    this.makeTweenVector(camera.position, initCamera.position, {
      duration: 1000,
      easing: TWEEN.Easing.Quadratic.Out,
      update: function(d){
        console.log('Reseting position')
      }
    })  
     this.makeTweenVector(camera.rotation, { x: initCamera.rotation.x, y: initCamera.rotation.y,  z: initCamera.rotation.z } , {
      duration: 1000,
      easing: TWEEN.Easing.Quadratic.Out,
      update: function(d){
        console.log('Reseting Rotation')
      }
    }) 
  }
    
  lookAtPoint = (e) => {
    
        const cameraAltitude = 200; //gives a good camera distance from the selected point
    
        let vector = new THREE.Vector3();
        vector.set(  ((e.clientX  - 1) / window.innerWidth) * 2 - 1,
                    -((e.clientY - 1) / window.innerHeight) * 2 + 1,
                     0.5 )
        raycaster.setFromCamera(vector, camera)
        let target = raycaster.intersectObject(wireframedMesh, false)

        if(target.length > 0){           
            // Get new camera position 
            var temp = new THREE.Mesh();
            var latlng = convertoLatLng(pickerPoint)
            //temp.position.copy(convertToXYZ(latlng, 300)); works weird         
            temp.position.copy(pickerPoint);   
            temp.lookAt(world.position);  //IMPROVE RIGHT THIS POINT!  Z camera position is soo close !!

            for (let key in temp.rotation) {
              if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
                temp.rotation[key] -= Math.PI * 2;
              } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
                temp.rotation[key] += Math.PI * 2;
              }
            }
          
            this.makeTweenVector(camera.position, { x: temp.position.x, y: temp.position.y, z: temp.position.z + cameraAltitude }, {
              duration: 1500,
              easing:  TWEEN.Easing.Quadratic.In,
              update: function(vector){
                console.log(vector.x + ' ' + vector.y  + ' ' + vector.z)
              },
            }) 
            
            /*this.makeTweenVector(camera.rotation, { x: temp.rotation.x, y: temp.rotation.y, z: temp.rotation.z }, {
              duration: 1500,
              easing:  TWEEN.Easing.Quadratic.In,
              update: function(vector){
                console.log(vector.x + ' ' + vector.y  + ' ' + vector.z)
              },
            }) */
            //makeTween for rotation!!! MAKE ROTATION TESTS!
       }
  } 
    
  createpointer = (mesh) => {
     if (pointer) mesh.remove(pointer); 
     pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
     pointer.position.copy(pickerPoint);
     mesh.add(pointer); 
  }
  
  highlightCounty = (point, mesh) => {
    
     var map, material;
     var latlng = convertoLatLng(point,sphereRadius);
          
     // Look for country at that latitude/longitude
     var country = geo.search(latlng[0], latlng[1]);

     if (country !== null && country.code !== currentCountry) {
        currentCountry = country.code
        this.props.onCountryChange(currentCountry)

        // Overlay the selected country
        map = this.textureCache(country.code, '#ffaa6f');
        material = new THREE.MeshPhongMaterial({map: map, transparent: true });
          if (!overlay) {  
              overlay = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 1 , 40, 40), material);
              overlay.name = 'Highlighter Mesh'
              mesh.add(overlay);
           } else {
             overlay.material = material;
          }
      }
  } 
  
  render() { 
    
    //Creates common geometry 
    var sphere = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereSegments);
    var waterMaterial  = new THREE.MeshPhongMaterial({color: '#056dba', 
                                                      transparent: false});
    var mapMaterial = new THREE.MeshPhongMaterial({ map: mapTexturer(topojson.feature(worlddata, worlddata.objects.countries), '#2ecc6f'), 
                                                    transparent: true});
    var waterMesh = new THREE.Mesh(sphere, waterMaterial);
    var mapMesh = new THREE.Mesh(sphere, mapMaterial);
 
    wireframeMaterial.opacity = wireframeOpacity

    waterMesh.name = 'Water Mesh'
    mapMesh.name = 'Map Mesh'
    wireframedMesh.name = 'Wireframed Mesh'

    world.add(waterMesh)
    world.add(mapMesh)
    world.add(wireframedMesh)
    scene.add(world)
        
    camera.updateMatrixWorld();
      
    var update = () => { // render() doesnt call with props or state updates, but update() keeps working every animFrame
        requestAnimationFrame(update.bind(this))
        if(this.props.rotable){
          this.props.rotable && this.rotateWorld(world, new THREE.Vector3(0, 1, 0), targetRotationX)
          this.props.rotable && this.rotateWorld(world, new THREE.Vector3(1, 0, 0), targetRotationY)
        }
        if(!this.props.rotable){
         TWEEN.update();
         window.addEventListener('dblclick', this.lookAtPoint )
        }
       
        
        targetRotationY = targetRotationY * (1 - easeFactor);    //couldbe changed!
        targetRotationX = targetRotationX * (1 - easeFactor); //couldbe changed!
      
       //RAYCASTING
        raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera)
        let target = raycaster.intersectObject(wireframedMesh, false) //(world, true)
        target.length > 0 && this.highlightCounty(pickerPoint, world)
        //pointer
        this.props.showPointer && this.createpointer(wireframedMesh)
        camera.updateMatrixWorld();
        renderer.render(scene, camera);
    }

   
    window.addEventListener('mousedown', this.handleClick )
    window.addEventListener('mousemove', this.handleMouseMove )
    window.addEventListener('mouseup', () => mouse.down = false , false )
    window.addEventListener('mouseout', () => mouse.move = false , false )
    window.addEventListener('contextmenu', event => event.preventDefault());

    requestAnimationFrame(update.bind(this))
    
    return (<div id='worldContainer'></div>)
    
   }
  
}

THREE.Mesh.prototype.raycast = (function () {
  var originalRaycast = THREE.Mesh.prototype.raycast;
  var localPoint = new THREE.Vector3 ()

  return function (raycaster, intersects) {
          originalRaycast.call (this, raycaster, intersects);
          for (var i = 0, n = intersects.length; i < n; i++) {
              if (this === intersects[i].object) {
                  this.worldToLocal (localPoint.copy (intersects[i].point));       
              
                  var face = intersects[i].face
                     // Get the vertices intersected
                  let a = this.geometry.vertices[face.a];
                  let b = this.geometry.vertices[face.b];
                  let c = this.geometry.vertices[face.c];

                  // Averge them together
                  let vector = new THREE.Vector3( (a.x + b.x + c.x) / 3,
                                                  (a.y + b.y + c.y) / 3,
                                                  (a.z + b.z + c.z) / 3 )

                  pickerPoint = vector
           }}}
})();