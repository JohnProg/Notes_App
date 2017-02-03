'use strict'

import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import Sound from 'react-native-sound';

class NoteAudioScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTime: 0,
      playing: false,
      paused: false,
      stopped: true,
    };
  }

  componentWillUnmount(){
    this._stop();
  }

  componentDidMount() {
    console.log(this.props.note.audioPath);
    this.audio = new Sound(this.props.note.audioPath, '', (error) => {
      if (error) {
        console.log('failed to load the sound', error);
      } else { // loaded successfully
        console.log('duration in seconds: ' + this.audio.getDuration() +
          'number of channels: ' + this.audio.getNumberOfChannels());

          this.setState({
            currentTime: Math.round(this.audio.getDuration())
          });
      }
    });

    console.log(this.audio);
  }

  _renderButton(title, onPress, active) {
    var style = (active) ? styles.activeButtonText : styles.buttonText;

    return (
      <TouchableOpacity style={styles.button} onPress={onPress} disabled={active}>
        <Text style={style}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  _pause(sound) {
    if (this.state.playing){
      this.audio.pause();
      this.setState({
        stopped: false,
        playing: true,
        paused: true});
    }
  }

  _stop() {
    if (this.state.playing) {
      this.audio.stop();
      this.setState({
        stopped: true,
        paused: false,
        playing: false,
        currentTime: Math.round(this.audio.getDuration())
      });
    }
    else{
      this.setState({
        stopped: true,
        paused: false,
        playing: false,
        currentTime: Math.round(this.audio.getDuration())
      });
    }
  }

  _play() {
    this.setState({
      playing: true,
      paused: false,
      stopped: false,
    });

    this.countDown();

    setTimeout(() => {
      this.audio.play((success) => {
        if (success) {
           console.log('successfully finished playing');
           this._stop();
         } else {
           console.log('playback failed due to audio decoding errors');
         }
      });
    }, 500)
  }

  countDown() {
    var setCurrentTime = () => {
      if(this.state.playing && this.state.currentTime > 0 && this.state.paused === false){
        this.setState({
          currentTime: this.state.currentTime - 1
        });
        console.log('playing');
      }
      else{
        clearInterval(countD);
        console.log('not playing');
      }
    }
    var countD = setInterval(setCurrentTime, 1000);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controls}>
          {this._renderButton("PLAY", () => {this._play()}, this.state.playing && !this.state.paused)}
          {this._renderButton("PAUSE", () => {this._pause()}, this.state.paused )}
          {this._renderButton("STOP", () => {this._stop()}, this.state.stopped )}
          <Text style={styles.progressText}>{this.state.currentTime}s</Text>
        </View>
      </View>
    );
  }
  }

  var styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#CDDC39",
    },
    controls: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    progressText: {
      paddingTop: 50,
      fontSize: 50,
      color: "#fff"
    },
    button: {
      padding: 20
    },
    disabledButtonText: {
      color: '#eee'
    },
    buttonText: {
      fontSize: 20,
      color: "#fff"
    },
    activeButtonText: {
      fontSize: 20,
      color: "#FF4081"
    }

  });

export default NoteAudioScreen;
