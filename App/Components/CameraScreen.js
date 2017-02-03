'use strict';
import React, { Component } from 'react';
import {
  Dimensions,
  StatusBar,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch
} from 'react-native';

import Camera from 'react-native-camera';
import SimpleButton from './SimpleButton';
import Icon from 'react-native-vector-icons/Ionicons';

export default class CameraScreen extends React.Component {
  constructor (props) {
    super(props);

    this.camera = null;

    this.state={
      camera: {
        aspect: Camera.constants.Aspect.fill,
        captureTarget: Camera.constants.CaptureTarget.cameraRoll,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
        flashMode: Camera.constants.FlashMode.auto,
      },
      mode: this.props.mode,
      isRecording: false,
      paused: false,
    }
  }
  takePicture(){
    this.camera.capture({mode: Camera.constants.CaptureMode.still})
       .then((data) => this.props.onPicture(data.path))
       .catch(err => console.error(err));
  }
  startRecording(){
    if (this.camera) {
      this.camera.capture({mode: Camera.constants.CaptureMode.video, captureAudio: true})
      .then((data) => {
        this.props.onVideoRecording(data.path);
        console.log(data.path);
      })
      .catch(err => console.error(err));
      this.setState({
        isRecording: true,
        paused: false
      });
    }
  }
  stopRecording(){
    if (this.camera) {
      this.camera.stopCapture();
      this.setState({
        isRecording: false,
        paused: false
      });
    }
  }
  pauseVideo() {
    if (this.camera) {
      //this.camera.pauseCapture();
      this.setState({
        paused: true
      });
    }
  }

  switchType = () => {
    let newType;
    const { back, front } = Camera.constants.Type;

    if (this.state.camera.type === back) {
      newType = front;
    } else if (this.state.camera.type === front) {
      newType = back;
    }

    this.setState({
      camera: {
        ...this.state.camera,
        type: newType,
      },
    });
  }

  get typeIcon() {
    let icon;
    const { back, front } = Camera.constants.Type;

    if (this.state.camera.type === back) {
      icon = require('./assets/ic_camera_rear_white.png');
    } else if (this.state.camera.type === front) {
      icon = require('./assets/ic_camera_front_white.png');
    }

    return icon;
  }

  switchFlash = () => {
    let newFlashMode;
    const { auto, on, off } = Camera.constants.FlashMode;

    if (this.state.camera.flashMode === auto) {
      newFlashMode = on;
    } else if (this.state.camera.flashMode === on) {
      newFlashMode = off;
    } else if (this.state.camera.flashMode === off) {
      newFlashMode = auto;
    }

    this.setState({
      camera: {
        ...this.state.camera,
        flashMode: newFlashMode,
      },
    });
  }

  get flashIcon() {
    let icon;
    const { auto, on, off } = Camera.constants.FlashMode;

    if (this.state.camera.flashMode === auto) {
      icon = require('./assets/ic_flash_auto_white.png');
    } else if (this.state.camera.flashMode === on) {
      icon = require('./assets/ic_flash_on_white.png');
    } else if (this.state.camera.flashMode === off) {
      icon = require('./assets/ic_flash_off_white.png');
    }

    return icon;
  }

  componentDidMount(){
    console.log(this.props.mode);
  }
  componentWillUnmount(){
    this.stopRecording();
  }
  render () {
    var button = null;

    (() => {
      switch (this.state.mode) {
        case 'photo':
        button =(
          <View style={[styles.cameraButtonWraper, styles.overlay]}>
            <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.button}>
              <Image
                source={require('./assets/ic_photo_camera_36pt.png')}
              />
            </TouchableOpacity>
          </View>
        );
        break;

        case 'video':
        button = !this.state.isRecording ? (
          <View style={[styles.cameraButtonWraper, styles.overlay]}>
            <TouchableOpacity onPress={this.startRecording.bind(this)} style={styles.button}>
              <Image
                source={require('./assets/ic_videocam_36pt.png')}
              />
            </TouchableOpacity>
          </View>
        ):(
          <View style={[styles.cameraButtonWraper, styles.overlay]}>

            <TouchableOpacity onPress={this.stopRecording.bind(this)} style={[styles.button]}>
              <Image
                source={require('./assets/ic_stop_36pt.png')}
              />
            </TouchableOpacity>

            {
              this.state.paused ? (

                <TouchableOpacity onPress={this.startRecording.bind(this)} style={styles.button} >
                  <Image
                    source={require('./assets/ic_videocam_36pt.png')}
                  />
                </TouchableOpacity>

              ):(

                <TouchableOpacity onPress={this.pauseVideo.bind(this)} style={styles.button}>
                  <Image
                    source={require('./assets/ic_pause_36pt.png')}
                  />
                </TouchableOpacity>

              )
            }

          </View>
        )
        break;
      }
    })();

    return (
      <View style={styles.container}>
        <StatusBar
          animated
          hidden
        />
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={this.state.camera.aspect}
          captureTarget={this.state.camera.captureTarget}
          type={this.state.camera.type}
          flashMode={this.state.camera.flashMode}
          defaultTouchToFocus
          mirrorImage={false}
        >
        </Camera>
        <View style={[styles.overlay, styles.topOverlay]}>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={this.switchType}
          >
            <Image
              source={this.typeIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={this.switchFlash}
          >
            <Image
              source={this.flashIcon}
            />
          </TouchableOpacity>
        </View>
        {button}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#000'
  },
  cameraButtonWraper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10
  },
  button:{
    marginHorizontal: 50,
    borderColor: '#FF4081',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    marginTop: 60,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  typeButton: {
    padding: 5,
  },
  flashButton: {
    padding: 5,
  },
  buttonsSpace: {
    width: 10,
  },
});
