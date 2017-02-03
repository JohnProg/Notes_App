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
import {AudioRecorder, AudioUtils} from 'react-native-audio';

class AudioRecordingScreen extends Component {

    state = {
      currentTime: 0.0,
      recording: false,
      playing: false,
      paused: false,
      stopped: true,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/' + this.props.note.id + '.aac'
    };

    prepareRecordingPath(audioPath){
      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac"
      });
    }

    componentDidMount() {
      //console.log(AudioRecorder);
      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)});
      };
      AudioRecorder.onFinished = (data) => {
        this.setState({finished: data.status == "OK"});
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${data.audioFileURL}`);
      };
    }

    componentWillUnmount(){
      this._stop();
    }

    _record() {
      if(this.state.currentTime == 0.0){
        this.props.onAudioRecording(this.state.audioPath);
        this.prepareRecordingPath(this.state.audioPath);
      }
      if(this.state.recording === false){
        AudioRecorder.startRecording();
        this.setState({recording: true, playing: false, paused: false, stopped: false});
      }
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

    _pause() {
      if (this.state.recording){
        AudioRecorder.pauseRecording();
        this.setState({
          paused: true,
          recording: false,
          playing: false});
      }
      if (this.state.playing){
        this.audioRecorded.pause();
        this.setState({
          recording: false,
          playing: false,
          paused: false});
      }

    }

    _stop() {
      if (this.state.recording) {
        AudioRecorder.stopRecording();
        this.setState({paused: false, recording: false, playing: false, stopped: true});
      }
      if (this.state.playing) {
        AudioRecorder.stopRecording();
        this.setState({paused: false, recording: false, playing: false, stopped: true});
      }
    }

    _play() {
      this._stop();

      this.audioRecorded = new Sound(this.state.audioPath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      this.setState({paused: false, recording: false, playing: true, stopped: false});
      setTimeout(() => {
        this.audioRecorded.play((success) => {
          if (success) {
            console.log('successfully finished playing');
            this.setState({playing: false, stopped: true});
           } else {
            console.log('playback failed due to audio decoding errors');
           }
        });
      }, 500)
    }

    render() {

      return (
        <View style={styles.container}>
          <View style={styles.controls}>
            {this._renderButton("RECORD", () => {this._record()}, this.state.recording || this.state.playing)}
            {this._renderButton("PLAY", () => {this._play()}, this.state.playing || this.state.currentTime === 0.0)}
            {this._renderButton("STOP", () => {this._stop()}, this.state.stopped)}
            {this._renderButton("PAUSE", () => {this._pause()}, this.state.stopped || this.state.paused)}
            <Text style={styles.progressText}>{this.state.currentTime}s</Text>
          </View>
        </View>
      );
    }
  }

  var styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#2b608a",
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

export default AudioRecordingScreen;
