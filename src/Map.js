import React, { Component } from 'react'
import worlddata from './data/world.json'
import { geoEquirectangular, geoPath } from 'd3-geo'
var topojson = require('topojson')
var THREE = require('three')

export default class WorldMap extends Component {

  getWorldTexture = () => {
      var canvas = document.createElement('canvas')
      canvas.setAttribute('width','960px') // 1024px LOOK FOR arms project to watch for a better resolution
      canvas.setAttribute('height','500px') // 512px
      var context = canvas.getContext('2d')
      var projection = geoEquirectangular()  //it's the final projection wrapper
      var featureData = topojson.feature(worlddata, worlddata.objects.countries)
      var pathGenerator = geoPath().projection(projection).context(context)//all the world map path
         context.strokeStyle = "#056dba";
         context.lineWidth = 0.25;
         context.fillStyle = "#2ecc6f";
         context.beginPath();

         pathGenerator(featureData);  //draws alls the image data. HERE IT'S THE MAGIC

         context.fill();
         context.stroke();
    
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      canvas.remove();

      return texture;
      
  } 
  
  rotateWorld = (object,axis, radians) => { // look for arms reference to look for better rotation!
     var rotationMatrix = new THREE.Matrix4();
         rotationMatrix.makeRotationAxis( axis.normalize(), radians );
         rotationMatrix.multiply( object.matrix );                       
      object.matrix = rotationMatrix;
      object.rotation.setFromRotationMatrix( object.matrix );
  }
 
  
   render() { 
    /* would check ir document != null */
    //render's global variables for mouse-dragging events for world rotation
    var targetRotationX = 0.5;
    var targetRotationY = 0.2;
     
    var mouseX = 0;
    var mouseXOnMouseDown = 0;

    var mouseY = 0;
    var mouseYOnMouseDown = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    
    var easeFactor = 0.15;
     
    //Set scene and three objects  
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 6000);
        camera.position.z = 500;
    var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement); //I WOULD RETURN renderer.domElement in this method!
    var light = new THREE.HemisphereLight('#fff', '#666', 1.5);
        light.position.set(0, 500, 0);
        scene.add(light);
    var waterMaterial  = new THREE.MeshBasicMaterial({color: '#056dba', transparent: true});  
    var mapMaterial = new THREE.MeshBasicMaterial({map: this.getWorldTexture(), transparent: true}); 
    var sphere = new THREE.SphereGeometry(200, 100, 100);
    var baseLayerMesh = new THREE.Mesh(sphere, waterMaterial);
    var mapLayerMesh = new THREE.Mesh(sphere, mapMaterial);
    var world = new THREE.Object3D();  // acts as an common 3d anchor point
        world.add(baseLayerMesh)
        world.add(mapLayerMesh)
    scene.add(world)
    
    var onDocumentMouseDown = (e) => {
        e.preventDefault();
        document.addEventListener( 'mousemove', onDocumentMouseMove, false )
        document.addEventListener( 'mouseup', onDocumentMouseUp, false )
        document.addEventListener( 'mouseout', onDocumentMouseOut, false )
        
        mouseXOnMouseDown = e.clientX - windowHalfX
        mouseYOnMouseDown = e.clientY - windowHalfY
    }
    
    var onDocumentMouseMove = (e) => {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
        targetRotationX = ( mouseX - mouseXOnMouseDown ) * 0.00025;
        targetRotationY = ( mouseY - mouseYOnMouseDown ) * 0.00025;
    }
    
    var onDocumentMouseUp = (e) => {
        document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
        document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    }
    
    var onDocumentMouseOut = (e) => {
        document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
        document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    }
    
    var reRender = () => {
        //root.rotation.y += 0.02;
        requestAnimationFrame(reRender.bind(this))
        this.rotateWorld(world, new THREE.Vector3(0, 1, 0), targetRotationX)
        this.rotateWorld(world, new THREE.Vector3(1, 0, 0), targetRotationY)
        targetRotationY = targetRotationY * (1 - easeFactor);    //couldbe changed!
        targetRotationX = targetRotationX * (1 - easeFactor); //couldbe changed!
        renderer.render(scene, camera);
    }
    
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    requestAnimationFrame(reRender.bind(this))
    
     
   return (<div></div>)
   }
  
}
