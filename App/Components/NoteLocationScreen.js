'use strict'

let _ = require('underscore');
import React, { Component } from 'react';
import {
     MapView,
     StyleSheet
   } from 'react-native';

export default class NoteLocationScreen extends React.Component {
   render () {

     var locations = _.values(this.props.notes).map((note) => {
       return {
         latitude: note.location.coords.latitude,
         longitude: note.location.coords.longitude,
         leftCallOutView: this.props.onSelectNote.bind(this,note),
         title: note.title
       };
     });

     return (
       <MapView
         annotations={locations}
         showsUserLocation={true}
         followUserLocation={true}
         style={styles.map}
       />
     );
   }
}

var styles = StyleSheet.create({
  map: {
    flex: 1,
    marginTop: 64
  }
});
