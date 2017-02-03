/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
'use strict'

const server = 'http://10.1.10.244:8888';

var uuid = require('react-native-uuid');

import React, { Component } from 'react';
import {
  AppRegistry,
  AsyncStorage,
  Navigator,
  NetInfo,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import SimpleButton from './App/Components/SimpleButton';
import NoteScreen from './App/Components/NoteScreen';
import HomeScreen from './App/Components/HomeScreen';
import NoteLocationScreen from './App/Components/NoteLocationScreen';
import CameraScreen from './App/Components/CameraScreen';
import LoginScreen from './App/Components/Authentication/LoginScreen';
import SignUpScreen from './App/Components/Authentication/SignUpScreen';
import VerificationScreen from './App/Components/Authentication/VerificationScreen';
import AccountScreen from './App/Components/Authentication/AccountScreen';
import ChatScreen from './App/Components/Chat/ChatScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import ResetPasswordScreen from './App/Components/Authentication/ResetPasswordScreen';
import io from 'socket.io-client/dist/socket.io';
import NoteImageScreen from './App/Components/NoteImageScreen';
import AudioRecordingScreen from './App/Components/AudioRecordingScreen';
import NoteAudioScreen from './App/Components/NoteAudioScreen';
import NoteVideoScreen from './App/Components/NoteVideoScreen';

var NavigationBarRouteMapper = {
  LeftButton: function(route, navigator, index, navState) {
    switch (route.name) {
      case 'home':
        return (
        <Icon name="md-map" style={styles.actionButtonIconL}
        onPress={() => navigator.push({name:'noteLocations'})}
        />
      );
      case 'createNote':
      case 'noteLocations':
      case 'camera':
      case 'audioRecorder':
      case 'account':
      case 'chat':
      case 'noteImage':
      case 'noteAudio':
      case 'noteVideo':
        return (
          <Icon name="ios-arrow-back" style={styles.actionButtonIconL}
          onPress={() => navigator.pop()}
          />
        );
      default:
        return null;
    }
  },
  RightButton: function(route, navigator, index, navState) {
    switch (route.name) {
      case 'home':
        return (
          <Icon name="md-create" style={styles.actionButtonIconR}
          onPress={() => {
            navigator.push({
              name: 'createNote',
              note: {
                id: uuid.v1(),
                title: '',
                body: ''
              }
            });
          }}
          />
        );
      case 'createNote':
        if (route.note.isSaved) {
          return (
            <Icon name="md-trash" style={styles.actionButtonIconL}
            onPress={
              () => {
                navigator.props.onDeleteNote(route.note);
                navigator.pop();
              }
            }
            />
          );
        } else {
          return null;
        }
      case 'noteImage':
        return (
          <Icon name="md-trash" style={styles.actionButtonIconL}
          onPress={() => {
           navigator.props.onDeleteNoteImage(route.note);
           navigator.pop();
          }}
          />
        );
      case 'noteAudio':
        return (
          <Icon name="md-trash" style={styles.actionButtonIconL}
          onPress={() => {
           navigator.props.onDeleteNoteAudio(route.note);
           navigator.pop();
          }}
          />
        );
      case 'noteVideo':
        return (
          <Icon name="md-trash" style={styles.actionButtonIconL}
          onPress={() => {
           navigator.props.onDeleteNoteVideo(route.note);
           navigator.pop();
          }}
          />
        );
      default:
         return null;
    }
  },
  Title: function(route, navigator, index, navState) {
    switch (route.name) {
      case 'home':
        return (
          <Text style={styles.navBarTitleText}>Notes</Text>
        );
      case 'createNote':
        return (
          <Text style={styles.navBarTitleText}>{route.note ? route.note.title : 'NNote'}</Text>
        );
      case 'noteLocations':
       return (
         <Text style={styles.navBarTitleText}>Note
           Locations</Text>
        );
      case 'camera':
        return (
          <Text style={styles.navBarTitleText}>Camera</Text>
        );
      case 'account':
        return (
          <Text style={styles.navBarTitleText}>Account Info</Text>
        );
      case 'chat':
        return (
          <Text style={styles.navBarTitleText}>Chat</Text>
        );
      case 'audioRecorder':
        return (
          <Text style={styles.navBarTitleText}>Audio Recorder</Text>
        );
      case 'noteImage':
        return (
         <Text style={styles.navBarTitleText}>{`Image: ${route.note.title}`}</Text>
        );
      case 'noteAudio':
        return (
         <Text style={styles.navBarTitleText}>{`Audio: ${route.note.title}`}</Text>
        );
      case 'noteVideo':
        return (
         <Text style={styles.navBarTitleText}>{`Video: ${route.note.title}`}</Text>
        );
    }
  }
};

class NotesApp extends React.Component {
  constructor(props) {
    super(props);

//sockets ======================================================

    this.socket = io(server, {jsonp: false});

    this.socket.on('connected', function (data) {
        console.log(data);
    });
// ==============================================================
    StatusBar.setBarStyle('light-content', true);
    this.state = {
      isReady: false,
      isConnected: null,
      nav:false,
      info:null,
      user:null,
      messages: [],
      notes:{}
    }
    this.loadInfo();
    this.loadNotes();
    this.loadMessages();
    this.trackLocation();
  }
  componentDidMount() {

    NetInfo.isConnected.addEventListener(
        'change',
        this._handleConnectivityChange
    );
    NetInfo.isConnected.fetch().done(
        (isConnected) => {
          console.log(isConnected);
          this.setState({isConnected});
        }
    );
  }
  _handleConnectivityChange = (isConnected) => {
    this.setState({
      isConnected,
    });
  };
  componentWillUnmount() {
     navigator.geolocation.clearWatch(this.watchID);

     NetInfo.isConnected.removeEventListener(
         'change',
         this._handleConnectivityChange
     );
  }
  trackLocation() {
    navigator.geolocation.getCurrentPosition(
      (initialPosition) => this.setState({initialPosition}),
      (error) => alert(error.message)
    );
    this.watchID = navigator.geolocation.watchPosition((lastPosition) => {
      this.setState({lastPosition});
    });
  }
  updateUser(user){
    console.log(user);
    this.setState({user:user});
  }
  showNav(){
    this.setState({nav:true});
  }
  hideNav(){
    this.setState({nav:false});
  }
  updateNote(note) {
    var newNotes = Object.assign({}, this.state.notes);
    if (!note.isSaved) {
     note.location = this.state.lastPosition;
    }
    note.isSaved = true;
    newNotes[note.id] = note;
    this.setState({notes:newNotes});
    this.saveNotes(newNotes);
  }
  deleteNote(note) {
    var newNotes = Object.assign({}, this.state.notes);
    delete newNotes[note.id];
    this.setState({notes:newNotes});
    this.saveNotes(newNotes);
  }
  removeUser(){
    this.setState({
      user:null
    });
  }
  saveNoteImage (imagePath, note) {
     note.imagePath = imagePath;
     this.updateNote(note);
  }
  deleteNoteImage (note) {
    note.imagePath = null;
    this.updateNote(note);
  }
  saveNoteAudio (audioPath, note){
    note.audioPath = audioPath;
    this.updateNote(note);
  }
  deleteNoteAudio (note) {
    note.audioPath = null;
    this.updateNote(note);
  }
  saveNoteVideo (videoPath, note){
    note.videoPath = videoPath;
    this.updateNote(note);
  }
  deleteNoteVideo (note) {
    note.videoPath = null;
    this.updateNote(note);
  }
  async loadNotes() {
    try {
      var notes = await AsyncStorage.getItem("@NotesApp:notes");
      if (notes !== null) {
        this.setState({
          notes:JSON.parse(notes)
        })
      }
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  async saveNotes(notes) {
    try {
      await AsyncStorage.setItem("@NotesApp:notes", JSON.stringify(notes));
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  async saveInfo(info) {
    try {
      await AsyncStorage.setItem("@NotesApp:info", JSON.stringify(info));
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  async loadInfo() {
    try {
      var info = await AsyncStorage.getItem("@NotesApp:info");
      if (info !== null) {
        console.log(JSON.parse(info));
        this.setState({
          info: JSON.parse(info),
          isReady: true
        });
      }
      else{
        this.setState({
          isReady: true
        });
      }
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  async saveMessages(messages) {
    try {
      await AsyncStorage.setItem("@NotesApp:messages", JSON.stringify(messages));
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  async loadMessages() {
    try {
      var messages = await AsyncStorage.getItem("@NotesApp:messages");
      if (messages !== null) {
        console.log(JSON.parse(messages));
        this.setState({
          messages: JSON.parse(messages)
        });
      }
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
  renderScene (route, navigator) {
    let _ = require('underscore');
    switch (route.name) {
      case 'signup':
      return (
          <SignUpScreen server={server} hideNav={this.hideNav.bind(this)} navigator={navigator} socket={this.socket} />
        );
      case 'login':
      return (
          <LoginScreen server={server} info={this.state.info} saveInfo={this.saveInfo.bind(this)} hideNav={this.hideNav.bind(this)} updateUser={this.updateUser.bind(this)} navigator={navigator} socket={this.socket} />
        );
      case 'resetpassword':
      return (
          <ResetPasswordScreen server={server} navigator={navigator} />
        );
      case 'verification':
      return (
          <VerificationScreen server={server} updateUser={this.updateUser.bind(this)} email={route.email} navigator={navigator} socket={this.socket} />
        );
      case 'account':
      return (
          <AccountScreen server={server} updateUser={this.updateUser.bind(this)} user={this.state.user} navigator={navigator} />
        );
      case 'home':
        return (
          <HomeScreen server={server} removeUser={this.removeUser.bind(this)} showNav={this.showNav.bind(this)} user={this.state.user} navigator={navigator} notes={_(this.state.notes).toArray()} onSelectNote={(note) => navigator.push({name:"createNote", note: note})} socket={this.socket}/>
        );
      case 'createNote':
        return (
          <NoteScreen server={server} navigator={navigator} NavigationBarRouteMapper={NavigationBarRouteMapper} note={route.note} onChangeNote={(note) => this.updateNote(note)}
          />
        );
      case 'noteLocations':
        return (
          <NoteLocationScreen server={server} notes={this.state.notes} onSelectNote={(note) => navigator.push({name:"createNote", note: note})} />
        );
      case 'camera':
        return (
          <CameraScreen server={server} mode={route.mode} onVideoRecording={(videoPath) => this.saveNoteVideo(videoPath, route.note)} onPicture={(imagePath) => this.saveNoteImage(imagePath, route.note)} />
        );
      case 'chat':
        return (
          <ChatScreen server={server} messages={this.state.messages} loadMessages={this.loadMessages.bind(this)} saveMessages={this.saveMessages.bind(this)} user={this.state.user} socket={this.socket} hideNav={this.hideNav.bind(this)} navigator={navigator} />
        );
      case 'noteImage':
        return (
          <NoteImageScreen server={server} navigator={navigator} note={route.note} />
        );
      case 'audioRecorder':
        return (
          <AudioRecordingScreen
            server={server}
            onAudioRecording={(audioPath) => this.saveNoteAudio(audioPath, route.note)}
            navigator={navigator} NavigationBarRouteMapper={NavigationBarRouteMapper} note={route.note} onChangeNote={(note) => this.updateNote(note)}
          />
        );
      case 'noteAudio':
        return (
          <NoteAudioScreen server={server} navigator={navigator} note={route.note}
          />
        );
      case 'noteVideo':
        return (
          <NoteVideoScreen server={server} navigator={navigator} note={route.note} />
        );
    }
  }
  sceneConfig(route, stack){
    switch (route.name) {
      case 'login':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'signup':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'resetpassword':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'verification':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'account':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'home':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'createNote':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'noteLocations':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'camera':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'chat':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'noteImage':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'audioRecorder':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'noteAudio':
        return Navigator.SceneConfigs.HorizontalSwipeJump;

      case 'noteVideo':
        return Navigator.SceneConfigs.HorizontalSwipeJump;
    }
  }
  render(){
    if(this.state.isReady){
      return (
        <Navigator
          configureScene={this.sceneConfig.bind(this)}
          initialRoute={{name: 'login'}}
          renderScene={this.renderScene.bind(this)}
          navigationBar={
            this.state.nav ?
            <Navigator.NavigationBar
              routeMapper={NavigationBarRouteMapper}
              style={styles.navBar}
            />
            : null
          }
          onDeleteNote={(note) => this.deleteNote(note)}
          onDeleteNoteImage={(note) => this.deleteNoteImage(note)}
          onDeleteNoteAudio={(note) => this.deleteNoteAudio(note)}
          onDeleteNoteVideo={(note) => this.deleteNoteVideo(note)}
        />
      );
    }
    else{
      return null;
    }
  }
}

var styles = StyleSheet.create({
    navBar: {
      backgroundColor: 'rgba(11, 12, 14, 0.0)',
      borderBottomColor: '#FFF',
      borderBottomWidth: 0
    },
    navBarTitleText: {
      color: '#FF4081',
      fontSize: 16,
      fontWeight: '500',
      marginVertical: 9  // iOS
   // marginVertical: 16 // Android
    },
    navBarLeftButton: {
      paddingLeft: 10
    },
    navBarRightButton: {
      paddingRight: 10
    },
    navBarButtonText: {
      color: '#EEE',
      fontSize: 16,
      marginVertical: 10 // iOS
   // marginVertical: 16 // Android
    },
    actionButtonIconL: {
      marginVertical: 9,
      fontSize: 25,
      color: '#FF4081',
      paddingRight: 10,
      paddingLeft: 10
    },
    actionButtonIconR: {
      marginVertical: 9,
      fontSize: 25,
      color: '#FF4081',
      paddingRight: 10,
      paddingLeft: 10
    }
});
AppRegistry.registerComponent('NotesApp', () => NotesApp);
