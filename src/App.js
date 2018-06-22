import React, { Component } from 'react';
import './css/app.css';
import World from './Map.js'

var currentCountry; //convert dangerously to state object BEWARE! must modify SHOULDCOMPONENTUPDATE() to prevent default react component re rendering

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      data: {},
      currentCountry: ''
    }
  }
  
  getCurrentCountry = (countryName) =>{
    console.log(countryName)
    currentCountry = countryName
    document.getElementById('countryName').innerHTML = currentCountry
  }
  
  render() {
    var countryNameStyle = {
      color: '#FFFFFF',
      fontSize:80,
      position: 'fixed',
      bottom:-49,
      left:0,
      width:'100%'
    }
    return (
      <div className="appHeader">
        <p className="App-intro">
           <code style={{color: 'white'}}>Prototipo GeoSearch</code>
        </p>
        <p className="App-intro">
           <code style={{color: 'white'}}>Draggable 3D world using ThreeJS and D3-geoJS on ReactJS</code>
        </p>
        <p id='countryName' style={countryNameStyle}></p>
        <World showPointer={true} onCountryChange={this.getCurrentCountry}/>
      </div>
    );
  }
}

export default App;


