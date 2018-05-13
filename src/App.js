import React, { Component } from 'react';
import './css/app.css';
import WorldMap from './Map.js'



class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      data: {}
    }
  }

  
  render() {
     
    return (
      <div className="App">
        <p className="App-intro">
           <code style={{color: 'white'}}>Prototipo GeoSearch</code>
        </p>
        <p className="App-intro">
           <code style={{color: 'white'}}>Draggable 3D world using ThreeJS and D3-geoJS on ReactJS</code>
        </p>
        <WorldMap />
      </div>
    );
  }
}

export default App;


