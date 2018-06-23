import React, { Component } from 'react'
import { scene, camera, renderer } from './lib/scene';
import { convertoLatLng, convertToXYZ, geodecoder } from './lib/geoHelpers';
import mapTexturer from './lib/mapTexturer'
import { getTween, memoize } from './lib/utils';
import worlddata from './data/world.json'
var topojson = require('topojson')
var THREE = require('three')
var d3 = require("d3");
var raycaster = new THREE.Raycaster()
var mouse = { x: 0, y: 0 , xdown: 0, ydown: 0, down: false, move: false }
var mouseVector = new THREE.Vector2();
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
var sphereSegments = 300; // vertices of the wireframesSphere. Higher improves mouse accuracy
var sphereRadius = 230;
var wireframeOpacity = 0.15

export default class Globe extends React.Component{
  
  shouldComponentUpdate(nextProps, nextState){ // this Component will never re render.
    return false;
  }
  
  textureCache = memoize(function (cntryID, color) {
      var country = geo.find(cntryID);
      return mapTexturer(country, color)
  });
  
  rotateWorld = (object,axis, radians) => { // look for arms reference to look for better rotation!
     var rotationMatrix = new THREE.Matrix4();
         rotationMatrix.makeRotationAxis( axis.normalize(), radians );
         rotationMatrix.multiply( object.matrix );                       
      object.matrix = rotationMatrix;
      object.rotation.setFromRotationMatrix( object.matrix );
  }
  
  handleClick = (e) => {
        e.preventDefault();
        mouse.down = (e.buttons !== 0 ? true : false)
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
  
  lookAtPoint = (e) => {

        let vector = new THREE.Vector2();
        vector.set(
           ((mouse.xdown - 1) / window.innerWidth) * 2 - 1,
          -((mouse.ydown - 1) / window.innerHeight) * 2 + 1 
        )
        
        raycaster.setFromCamera(vector, camera)
        
        let target = raycaster.intersectObject(world, true)
        // Get point in  latitude/longitude coordinates format
        var latlng = convertoLatLng(pickerPoint)
        console.log(latlng)
        // Get new camera position
        var temp = new THREE.Mesh();
            //temp.position.copy(convertToXYZ(latlng, 200));
            temp.position.copy(latlng);
            temp.lookAt(world.position);
        //temp.rotateY(Math.PI);

        for (let key in temp.rotation) {
          if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
            temp.rotation[key] -= Math.PI * 2;
          } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
            temp.rotation[key] += Math.PI * 2;
          }
        }
        /*if(latlng[0] !== 0 && latlng[1] !== 0){
          var tweenPos = getTween.call(camera, 'position', temp.position);
          d3.timer(tweenPos);

          var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
          d3.timer(tweenRot);
        }*/
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
        material = new THREE.MeshPhongMaterial({map: map, transparent: false });
          if (!overlay) {  
              overlay = new THREE.Mesh(new THREE.SphereGeometry(204, 40, 40), material);
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
                                                      transparent: true});
    var mapMaterial = new THREE.MeshPhongMaterial({ map: mapTexturer(topojson.feature(worlddata, worlddata.objects.countries), '#2ecc6f'), 
                                                    transparent: true});
    var wireframeMaterial = new THREE.MeshPhongMaterial({wireframe: true, transparent: true })
    wireframeMaterial.opacity = wireframeOpacity
    var waterMesh = new THREE.Mesh(sphere, waterMaterial);
    var mapMesh = new THREE.Mesh(sphere, mapMaterial);
    var wireframedMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 1 , sphereSegments, sphereSegments), 
                                        wireframeMaterial)
    waterMesh.name = 'Water Mesh'
    mapMesh.name = 'Map Mesh'
    wireframedMesh.name = 'Wireframed Mesh'
    waterMesh.rotation.y = Math.PI;
    mapMesh.rotation.y = Math.PI;
    wireframedMesh.rotation.y = Math.PI;
    
    world.add(waterMesh)
    world.add(mapMesh)
    world.add(wireframedMesh)
    scene.add(world)
        
    camera.updateMatrixWorld();
      
    var reRender = () => {
        requestAnimationFrame(reRender.bind(this))
        this.rotateWorld(world, new THREE.Vector3(0, 1, 0), targetRotationX)
        this.rotateWorld(world, new THREE.Vector3(1, 0, 0), targetRotationY)
        targetRotationY = targetRotationY * (1 - easeFactor);    //couldbe changed!
        targetRotationX = targetRotationX * (1 - easeFactor); //couldbe changed!
      
       //RAYCASTING
        mouseVector.x = mouse.x
        mouseVector.y = mouse.y
        raycaster.setFromCamera(mouseVector, camera)
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

    requestAnimationFrame(reRender.bind(this))
    
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
              
                  var face = intersects[i].face, faceIndex = intersects[i].faceIndex
                     // Get the vertices intersected
                  let a = this.geometry.vertices[face.a];
                  let b = this.geometry.vertices[face.b];
                  let c = this.geometry.vertices[face.c];

                  // Averge them together
                  let point = {
                    x: (a.x + b.x + c.x) / 3,
                    y: (a.y + b.y + c.y) / 3,
                    z: (a.z + b.z + c.z) / 3
                  };

                  pickerPoint = point
           }}}
})();