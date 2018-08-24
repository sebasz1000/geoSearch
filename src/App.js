import React from 'react';
import './css/app.css';
import Globe from './Globe.js'
import ListItem from './listItem'

var selected = []
 
class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: {},
      currentCountry: '',
    }
  }
  
  getCurrentCountry = (countryName) => this.setState({currentCountry: countryName})
  
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
    
    var list = [
      { 
        name: 'colombia',
        students: [ 
          {
            name: 'Pepito Perez',
            degree: 'Administrador de Empresas',
            phone: '3002456789',
            email: 'pepitoPerez@gmail.com'
          },
          {
            name: 'Fulanita Gomez',
            degree: 'Diseñador Grafica',
            phone: '31225656789',
            email: 'FulanitaGomez@gmail.com'
          }
        ]
      },
      { 
        name: 'mexico',
        students: [ 
          {
            name: 'Paquita Rivera',
            degree: 'Vendedor de carros',
            phone: '+45 400675585',
            email: 'paquita.rivera@gmail.com'
          },
          {
            name: 'Cantinflas',
            degree: 'Actor',
            phone: '2344354567',
            email: 'canti.flas@gmail.com'
          }
        ]
      },
      { 
        name: 'brazil',
        students: [ 
          {
            name: 'Hermeto Pascoal',
            degree: 'Músico',
            phone: '+45 400675585',
            email: 'hermoto.pascoal@gmail.com'
          },
          {
            name: 'Pedro Hernandez',
            degree: 'Ingeniero',
            phone: '2344354567',
            email: 'pedro.Hernandez@gmail.com'
          }
        ]
      },
      { 
        name: 'peru',
        students: [ 
          {
            name: 'Gustavo Lima',
            degree: 'Mecatrónico',
            phone: '+45 400675585',
            email: 'hermoto.pascoal@gmail.com'
          },
          {
            name: 'Ana Jimenez',
            degree: 'Ingeniera',
            phone: '2344354567',
            email: 'pedro.Hernandez@gmail.com'
          },
           {
            name: 'Maria Solano',
            degree: 'Economista',
            phone: '2344354567',
            email: 'pedro.Hernandez@gmail.com'
          }
        ]
      },
      { 
        name: 'united states',
        students: [ 
          {
            name: 'Lewis Price',
            degree: 'Astronauta',
            phone: '+45 400675585',
            email: 'hermoto.pascoal@gmail.com'
          },
          {
            name: 'Gena Lamark',
            degree: 'Programadora',
            phone: '2344354567',
            email: 'pedro.Hernandez@gmail.com'
          },
           {
            name: 'Miryan Gonzales',
            degree: 'Estadista',
            phone: '2344354567',
            email: 'pedro.Hernandez@gmail.com'
          }
        ]
      }
    ]
    
    selected = []
    
    list.forEach((item, index) => {
       if(this.state.currentCountry.toLowerCase().indexOf(item.name) > -1){
         selected = item.students
       }     
    })
    
    return (
      <div id='main'>
        <div className="appHeader">
          <p className="App-intro">
             <code style={{color: 'white'}}>Prototipo GeoSearch</code>
          </p>
          <p className="App-intro">
             <code style={{color: 'white'}}>Orbitable 3D world using ThreeJS and D3-geoJS on ReactJS</code>
          </p>
          <p id='countryName' style={countryNameStyle}>{this.state.currentCountry}</p>
          </div>
          <div id='list'>
            <h1 style={{borderBottom: '1px solid black'}}>{this.state.currentCountry}</h1>
            <div>
              { selected.map( (item, i) => <ListItem name={item.name} 
                                                      degree={item.degree} 
                                                      key={i}/> )}
            </div>
          </div>
        <Globe showPointer={true} 
               onCountryChange={this.getCurrentCountry} />
     </div> 
    );
  }
}

export default App;

