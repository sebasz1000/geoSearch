import { geoEquirectangular, geoPath } from 'd3-geo'
var THREE = require('three')


export default function mapTexturer(geojson, color){
      var canvas = document.createElement('canvas')
      canvas.setAttribute('width','2048px') // 2048   2xHeight       
      canvas.setAttribute('height','1024px') // 1024
      var context = canvas.getContext('2d')
      var projection = geoEquirectangular().translate([1024,512]).scale(325) //it's the final projection wrapper
      //var featureData = topojson.feature(worlddata, worlddata.objects.countries)
      var pathGenerator = geoPath().projection(projection).context(context)//all the world map path
         context.strokeStyle = "#056dba";
         context.lineWidth = 0.25;
         context.fillStyle = color || "#CDB380";
         context.beginPath();
         pathGenerator(geojson);  //draws alls the image data. HERE IT'S THE MAGIC
         color && context.fill();
         context.stroke();
    
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      canvas.remove();

      return texture;
      
  } 