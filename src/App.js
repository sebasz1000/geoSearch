import React from 'react';
import './css/app.css';
import Globe from './Globe.js'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: {},
      currentCountry: '',
      mode: false, // TRUE draggable, FALSE orbitable
    }
  }
  
  getCurrentCountry = (countryName) => this.setState({currentCountry: countryName})
  
  changeInteractionMode = (e) => {
    this.setState({ mode: !this.state.mode })
  }
  
  render() {
    var btncolor = this.state.mode ? '#0cf108' : 'rgba(255,255,255,0.3)'
    var countryNameStyle = {
      color: '#FFFFFF',
      fontSize:80,
      position: 'fixed',
      bottom:-49,
      left:0,
      width:'100%'
    }
    var btnStyle = {
      fontSize: 28,
      fontWeight: 'bold',
      backgroundColor: btncolor,
      border: 'none',
      position: 'absolute',
      top: 45,
      right: 28
      
    }
    return (
      <div id='main'>
        <div className="appHeader">
          <p className="App-intro">
             <code style={{color: 'white'}}>Prototipo GeoSearch</code>
          </p>
          <p className="App-intro">
             <code style={{color: 'white'}}>Draggable 3D world using ThreeJS and D3-geoJS on ReactJS</code>
          </p>
          <p id='countryName' style={countryNameStyle}>{this.state.currentCountry}</p>
          <button style={btnStyle} type='button' onClick={this.changeInteractionMode}>Draggable{this.state.mode ? ' ON' : ' OFF'}</button>
          </div>
        <Globe showPointer={true} 
               onCountryChange={this.getCurrentCountry}
               rotable={this.state.mode}/>
     </div> 
    );
  }
}

export default App;

