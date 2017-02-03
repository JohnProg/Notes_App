'use strict';

import React, { Component } from 'react';
import {
  Alert,
  Image,
  View,
  StyleSheet
} from 'react-native';

export default class NoteImageScreen extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <Image
        source={{uri: this.props.note.imagePath}}
        style={styles.image}
        />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64
  },
  image: {
    flex: 1
  }  
});
