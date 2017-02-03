'use strict'

var uuid = require('react-native-uuid');

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import SimpleButton from './SimpleButton';

export default class HomeButton extends React.Component {
  render () {
    return (
      <View style={styles.cnBtn}>
        <Text style={styles.noNotesText}>{this.props.text}</Text>

        <SimpleButton
          onPress={() => {
            this.props.navigator.push({
              name: 'createNote',
              note: {
                id: uuid.v1(),
                title: '',
                body: ''
              }
            });
          }}
          customText="Create Note"
          style={styles.simpleButton}
          textStyle={styles.simpleButtonText}
        />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  noNotesText: {
    color: '#2b608a',
    marginBottom: 10
  },
  cnBtn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0
  },
  simpleButton: {
    backgroundColor: '#FF4081',
    borderColor: '#FF4081',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: 'darkgrey',
    shadowOffset: {
        width: 1,
        height: 1
    },
    shadowOpacity: 0.8,
    shadowRadius: 1
  },
  simpleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});
