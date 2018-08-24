import React from 'react'
import { scene, camera, renderer } from './lib/scene';
import { convertoLatLng, convertToXYZ, geodecoder } from './lib/geoHelpers';
import mapTexturer from './lib/mapTexturer'
import { memoize } from './lib/utils';
import worlddata from './data/world.json'
const OrbitControls = require('three-orbitcontrols')
var TWEEN = require('@tweenjs/tween.js');
var topojson = require('topojson')
var THREE = require('three')
var raycaster = new THREE.Raycaster()
var mouse = { x: 0, y: 0 , z: 15}
var pickerPoint = new THREE.Vector3();
var holdCountry = false;
var currentCountry, overlay, pointer;
const randomPoint = new THREE.Vector3()
var world = new THREE.Object3D();   // acts as an common 3d anchor point
world.name = 'World Obj'

var countries = topojson.feature(worlddata, worlddata.objects.countries)
var geo = geodecoder(countries.features);

const pointerGeometry = new THREE.SphereGeometry(0.008, 300, 300);
const pointerMaterial = new THREE.MeshPhongMaterial({color: 'red'});

// world settings    
var easeFactor = 0.10;  // lower it will stop later
var sphereSegments = 400; // vertices of the wireframesSphere. Higher improves mouse accuracy
var sphereRadius = 10; //230
var wireframeOpacity = 0.15
const minAltitude = sphereRadius + 4


var wireframeMaterial = new THREE.MeshPhongMaterial({wireframe: true, transparent: true, opacity: 0.1 })
var wireframedMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 0.04 , sphereSegments, sphereSegments), 
                                        wireframeMaterial)

var initialCameraSetup = new THREE.PerspectiveCamera();

const controls = new OrbitControls(camera, renderer.domElement)

export default class Globe extends React.Component{
  
  shouldComponentUpdate(nextProps, nextState){ // this Component will never re render.
    return false;
  }
  
  componentDidMount(){
    initialCameraSetup.copy(camera)
    controls.enableDamping = true
    controls.minDistance = minAltitude
    controls.maxDistance = sphereRadius + 12
    camera.position.set(1,1,sphereRadius + 12);
  } 
  
  textureCache = memoize(function (cntryID, color) {
      var country = geo.find(cntryID);
      return mapTexturer(country, color)
  });
  
  handleClick = (e) => {
        e.preventDefault();
        e.button === 2 && console.log('SHOULD RESET CAMERA  ALTITUDE')
  }
  
  handleMouseMove = (e) => {
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;
    
       //RAYCASTING
        if(this.raycast(new THREE.Vector3(mouse.x, mouse.y, mouse.z), camera, wireframedMesh).length > 0 && !holdCountry) this.highlightCounty(pickerPoint, world)
        //pointer
        this.props.showPointer && this.createpointer(wireframedMesh)
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
  
  makeTween = (source, target, options, method) => {
   options = options || {} 
   const tween = new TWEEN.Tween(source).to(target, options.speed).delay(options.delay).easing(TWEEN.Easing.Quadratic.Out).onUpdate(method).start()
  }
  
  cameraMove = (zoomFactor, targetVector) => {
	var sourceAltitude = { length: camera.position.length() }
	
    this.makeTween(sourceAltitude, { length: zoomFactor }, { speed: 2000, delay: 300 } , () => {} ) // zoom in out
   	
    var interpolationAngles = this.getAngleFromVectors3(camera.position, targetVector)
    var movingSpherical = new THREE.Spherical()
      
    this.makeTween(interpolationAngles[0], interpolationAngles[1], { speed: 2000, delay: 100 } , function(){   // cam rotation
         movingSpherical.set( sourceAltitude.length, interpolationAngles[0].phi, interpolationAngles[0].theta);
         camera.position.setFromSpherical(movingSpherical) 
    })
  
    camera.updateProjectionMatrix()
  }
  
  lookAtPoint = (e) => {
    
   let vector = new THREE.Vector3();
   vector.set(  ((e.clientX  - 1) / window.innerWidth) * 2 - 1,
                 -((e.clientY - 1) / window.innerHeight) * 2 + 1,
                 0.5 )
  
   if(this.raycast(vector, camera, wireframedMesh).length > 0){ 
    holdCountry = true;
    this.highlightCounty(pickerPoint, world)
    randomPoint.set(THREE.Math.randFloat( -(sphereRadius + 5), sphereRadius + 5 ), 0 , sphereRadius + 5)
    this.cameraMove(minAltitude, randomPoint) //zooms camera in
    
    const euler = new THREE.Euler()
    var startQuaternion = new THREE.Quaternion()
    const endQuaternion = this.getQuaternionFromPoints(pickerPoint, randomPoint)    
    startQuaternion.copy(world.quaternion).normalize()
      
    this.makeTween(startQuaternion, endQuaternion, { speed: 2000, delay: 300 } ,   //sphere rotation
      function(){
        euler.setFromQuaternion(startQuaternion)
        world.setRotationFromEuler(euler)
    })
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
              overlay = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 0.04 , 40, 40), material);
              overlay.name = 'Highlighter Mesh'
              mesh.add(overlay);
           } else {
             overlay.material = material;
          }
      }
  } 
  
  raycast = (vector, cam, mesh) => {
    vector = vector || new THREE.Vector3()
    raycaster.setFromCamera(vector, cam)
    return raycaster.intersectObject(mesh, false) //(world, true)
  }
  
  getAngleFromVectors3 = (initPoint, endPoint) => {  // returns source and target angles between two spherical points to make interpolation

    const sphericalStart = new THREE.Spherical()
    const sphericalEnd = new THREE.Spherical()
      const sourceAngle = {
          phi: 0,
          theta: 0
    };
    const targetAngle = {
          phi: 0,
          theta: 0
    };
    sphericalStart.setFromVector3(initPoint)
    sphericalEnd.setFromVector3(endPoint)
    sphericalEnd.makeSafe()

    sourceAngle.phi = sphericalStart.phi
    sourceAngle.theta = sphericalStart.theta
    targetAngle.phi = sphericalEnd.phi
    targetAngle.theta = sphericalEnd.theta

    return [sourceAngle, targetAngle]
 }

  getQuaternionFromPoints = (initPoint, endPoint) => {
    var startVector = (initPoint === undefined ? new THREE.Vector3() : initPoint.normalize())
    var endVector = (endPoint === undefined ? new THREE.Vector3() : endPoint.normalize())
    var q = new THREE.Quaternion();

    q.setFromUnitVectors(startVector, endVector)

    return q 
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
       
        TWEEN.update();
        camera.updateMatrixWorld();
        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener('dblclick', this.lookAtPoint )
    window.addEventListener('mousedown', this.handleClick )
    window.addEventListener('mousemove', this.handleMouseMove )
    //window.addEventListener('contextmenu', event => event.preventDefault());
    document.getElementById('canvas').addEventListener('wheel', (e) => {  if(e.deltaY > 0) holdCountry = false;  });

    requestAnimationFrame(update.bind(this))
    
    return null
    
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