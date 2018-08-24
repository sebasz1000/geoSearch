import React from 'react';
import './css/app.css';

export default class ListItem extends React.Component {
  constructor(props){
    super(props)
  }
  render() {
    return <div id='listItem'><h3>{this.props.name}</h3><p style={{ color: '#969696'}}>{this.props.degree}</p></div>
  }
}


