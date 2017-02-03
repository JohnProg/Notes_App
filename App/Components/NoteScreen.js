'use strict'

var uuid = require('react-native-uuid');

import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text
} from 'react-native';

import SimpleButton from './SimpleButton';
import Icon from 'react-native-vector-icons/Ionicons';

export default class NoteScreen extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      note:this.props.note,
      title: this.props.note.title,
      body: this.props.note.body
    };
  }
  componentDidMount(){
    console.log(this.props.note);
  }
  updateNote(title, body) {
    var note = Object.assign(this.state.note, {title:title, body:body});
    this.props.onChangeNote(note);
    this.setState(note);
  }
  blurInputs () {
    this.refs.body.blur();
    this.refs.title.blur();
  }
  render () {
    //console.log(this.props.note);
    var pictureButton     = null;
    var recordAudioButton = null;
    var recordVideoButton = null;

    recordAudioButton = (this.state.note.audioPath) ?
    (
      <TouchableOpacity
      onPress={() => {
        this.blurInputs();
        this.props.navigator.push({
          name: 'noteAudio',
          note: this.state.note
        });
      }}
      >
        <Icon
        name="md-recording"
        size={70}
        color="#FF4081"
        />
      </TouchableOpacity>
    ):(
      <TouchableOpacity
      onPress={() => {
        this.blurInputs();
        this.props.navigator.push({
          name: 'audioRecorder',
          note: this.state.note
        });
      }}
      >
        <Icon
        name="ios-mic-outline"
        size={90}
        color="#2b608a"
        />
      </TouchableOpacity>
    );

    recordVideoButton = (this.state.note.videoPath) ?
    (
      <TouchableOpacity
      onPress={() => {
        this.blurInputs();
        this.props.navigator.push({
          name: 'noteVideo',
          note: this.state.note
        });
      }}
      >
        <Icon
        name="ios-film"
        size={70}
        color="#FF4081"
        />
      </TouchableOpacity>
    ):(
      <TouchableOpacity
      onPress={() => {
        this.blurInputs();
        this.props.navigator.push({
          name: 'camera',
          note: this.state.note,
          mode: 'video'
        });
      }}
      >
        <Icon
        name="ios-videocam-outline"
        size={70}
        color="#2b608a"
        />
      </TouchableOpacity>
    );


    pictureButton = (this.state.note.imagePath) ?
    (
      <TouchableOpacity
      onPress={() => {
        this.blurInputs();
        this.props.navigator.push({
          name: 'noteImage',
          note: this.state.note
        });
      }}
      >
        <Icon
        name="md-image"
        size={70}
        color="#FF4081"
        />
      </TouchableOpacity>
    ):(
      <TouchableOpacity
      onPress={() => {
        this.blurInputs();
        this.props.navigator.push({
          name: 'camera',
          note: this.state.note,
          mode: 'photo'
        });
      }}
      >
        <Icon
        name="ios-camera-outline"
        size={70}
        color="#2b608a"
        />
      </TouchableOpacity>
    );
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref="title"
            autoFocus={false}
            autoCapitalize="sentences"
            placeholder="Untitled"
            style={[styles.textInput, styles.title]}
            onEndEditing={(text) => {this.refs.body.focus()}}
            underlineColorAndroid="transparent"
            value={this.state.title}
            onChangeText={(title) => this.updateNote(title, this.state.note.body)}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            ref="body"
            multiline={true}
            placeholder="Start typing"
            style={[styles.textInput, styles.body]}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            value={this.state.body}
            onChangeText={(body) => this.updateNote(this.state.note.title, body)}
          />
        </View>

        <View style={styles.cameraButtonContainer}>

          {pictureButton}

          {recordAudioButton}

          {recordVideoButton}

        </View>

      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
    padding: 20
  },
  title: {
    height: 40
  },
  body: {
    height: 250
  },
  inputContainer: {
    borderBottomColor: '#FF4081',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 10
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  cameraButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20
  },
  simpleButton: {
    backgroundColor: '#5B29C1',
    borderColor: '#48209A',
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
    fontSize: 16,
    textAlign: 'center'
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

});
