import React from 'react';
import './css/app.css';
import Globe from './Globe.js'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: {},
      currentCountry: ''
    }
  }
  
  getCurrentCountry = (countryName) => this.setState({currentCountry: countryName})
  
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
        <p id='countryName' style={countryNameStyle}>{this.state.currentCountry}</p>
        <Globe showPointer={true} 
               onCountryChange={this.getCurrentCountry}
               rotable={false}/>
      </div>
    );
  }
}

export default App;


