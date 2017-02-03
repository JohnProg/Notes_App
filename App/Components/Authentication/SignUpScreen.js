'use strict'

import React, { Component } from 'react'
import {
  Alert,
  DeviceEventEmitter,
  ActivityIndicator,
  NativeModules,
  CameraRoll,
  Modal,
  ListView,
  PixelRatio,
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity
} from 'react-native'

import DatePicker from 'react-native-datepicker';
import Icon from 'react-native-vector-icons/Ionicons';

var ImagePicker = NativeModules.ImageCropPicker;

var uuid = require('react-native-uuid');
var RNUploader = require('NativeModules').RNUploader;

const background    = require("./images/signup_bg.png");
const backIcon      = require("./images/back.png");
const personIcon    = require("./images/signup_person.png");
const lockIcon      = require("./images/signup_lock.png");
const emailIcon     = require("./images/signup_email.png");
const birthdayIcon  = require("./images/signup_birthday.png");
const addpersonicon = require("./images/add_person_icon.png");

export default class SignUpScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      uploading: false,
      showUploadModal: false,
      uploadProgress: 0,
      uploadTotal: 0,
      uploadWritten: 0,
      uploadStatus: undefined,
      cancelled: false,
      image: addpersonicon,
      credentials: {'name': '', 'email': '', 'password': '', 'birthday': ''}
    };
  }
  updateCredentials(name, email, password, birthday) {
    var credentials = Object.assign(this.state.credentials, {
      'name':name,
      'email':email.trim(),
      'password':password,
      'birthday':birthday
    });
    this.setState(credentials);
  }
  componentDidMount(){
    // upload progress
    DeviceEventEmitter.addListener('RNUploaderProgress', (data) => {
      let bytesWritten = data.totalBytesWritten;
      let bytesTotal   = data.totalBytesExpectedToWrite;
      let progress     = data.progress;
      this.setState({uploadProgress: progress, uploadTotal: bytesTotal, uploadWritten: bytesWritten});
    });
  }
  pickSingle(cropit, circular=false) {
    ImagePicker.openPicker({
      width: 100,
      height: 100,
      cropping: cropit,
      cropperCircleOverlay: circular,
      compressImageMaxWidth: 100,
      compressImageMaxHeight: 100,
      compressImageQuality: 1.0,
      compressVideoPreset: 'MediumQuality',
    }).then(image => {
      console.log('received image', image);
      this.setState({
        image: {uri: image.path, width: image.width, height: image.height, mime: image.mime}
      });
    }).catch(e => {
      console.log(e);
      Alert.alert(e.message ? e.message : e);
    });
  }
  cleanImagePicker(){
    ImagePicker.clean().then(() => {
      console.log('removed all tmp images from tmp directory');
    }).catch(e => {
      alert(e);
    });
  }
  _uploadImages() {
    let files = [{
      name: 'file',
      filename: 'avatar.png',
      filepath: this.state.image.uri,
      filetype: 'image/png',
    }];

    let opts = {
      url: this.props.server+'/userupload',
      method: 'POST',
      files: files,
      params: {user: this.state.credentials.email}
    };

    this.setState({ uploading: true, showUploadModal: true, });
    RNUploader.upload(opts, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }

      let status = res.status;
      let responseString = res.data;

      console.log('Upload complete with status ' + status);
      console.log(responseString);
      this.setState({uploading: false, uploadStatus: status});
    });

  }
  createUser(){
    var credentials = this.state.credentials;

    var validateName = (name) => {
      var re = /^[a-zA-Z ]{2,30}$/;
      return re.test(name);
    };

    var validateEmail = (email) => {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };

    var validatePassword = (password) => {
      var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      return re.test(password);
    };

    if (!validateEmail(credentials.email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email.',
      )
    }
    else if (!validatePassword(credentials.password)) {
      Alert.alert(
        'Invalid Password',
        'Password must have at least 6 characters incuding 1 capital letter, 1 lowercase letter and 1 number.',
      )
    }
    else if (!validateName(credentials.name)) {
      Alert.alert(
        'Invalid Name',
        'Please enter a valid name.',
      )
    }
    else if (!credentials.birthday) {
      Alert.alert(
        'No Date Has Been Selected',
        'Please select your date of birth.',
      )
    } else {
      var that = this;
      // data validated
      fetch(this.props.server+'/signup',{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }).then(function(response) {
          if(response.status == 200){
            that._uploadImages();
            return response.json();
          }
          else{
            throw new Error('Something went wrong on api server!');
          }
      }).then(function(response) {
          console.log(response);
          if(!response.info.success){
            Alert.alert(
              'Registration Failed',
              response.info.message,
            )
          }
          else{
            that.props.socket.emit('user', response.info.email);
            that.props.navigator.push({
              email: response.info.email,
              name: 'verification',
              note: {
                id: uuid.v1()
              }
            });
          }
      }).catch(function(error) {
          console.error(error);
      });
    }
  }
  render() {
    var _scrollView: ScrollView;
    return (
      <View style={styles.container}>
        <Image
          source={background}
          style={[styles.container, styles.bg]}
          resizeMode="cover"
        >
          <ScrollView
            ref={(scrollView) => { _scrollView = scrollView; }}
            automaticallyAdjustContentInsets={false}
            onScroll={() => { console.log('onScroll!'); }}
            scrollEventThrottle={200}
            style={styles.scrollView}>

            <View style={styles.headerContainer}>
              <View style={styles.headerIconView}>
                <TouchableOpacity style={styles.headerBackButtonView}
                onPress={() => {
                  this.props.navigator.push({
                    name: 'login'
                  });
                }}
                >
                  <Image
                    source={backIcon}
                    style={styles.backButtonIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.imageContainer}>
                <TouchableOpacity onPress={() => this.pickSingle(true, true)}>
                  <View style={styles.imageWrap}>
                    <Image source={this.state.image} style={styles.profileImg} resizeMode="contain" />
                  </View>
                  <Text style={styles.textPic}>
                    Upload Profile Picture
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputsContainer}>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Image
                    source={personIcon}
                    style={styles.inputIcon}
                    resizeMode="contain"
                  />
                </View>
                <TextInput
                  style={[styles.input, styles.whiteFont]}
                  placeholder="Name"
                  placeholderTextColor="#FFF"
                  underlineColorAndroid='transparent'
                  onChangeText={(name) => {this.updateCredentials(
                    name,
                    this.state.credentials.email,
                    this.state.credentials.password,
                    this.state.credentials.birthday)
                  }}
                  value={this.state.credentials.name}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Image
                    source={emailIcon}
                    style={styles.inputIcon}
                    resizeMode="contain"
                  />
                </View>
                <TextInput
                  style={[styles.input, styles.whiteFont]}
                  keyboardType="email-address"
                  placeholder="Email"
                  placeholderTextColor="#FFF"
                  onChangeText={(email) => {this.updateCredentials(
                    this.state.credentials.name,
                    email,
                    this.state.credentials.password,
                    this.state.credentials.birthday)
                  }}
                  autoCapitalize="none"
                  value={this.state.credentials.email}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Image
                    source={lockIcon}
                    style={styles.inputIcon}
                    resizeMode="contain"
                  />
                </View>
                <TextInput
                  secureTextEntry={true}
                  style={[styles.input, styles.whiteFont]}
                  placeholder="Password"
                  placeholderTextColor="#FFF"
                  onChangeText={(password) => {this.updateCredentials(
                    this.state.credentials.name,
                    this.state.credentials.email,
                    password,
                    this.state.credentials.birthday)
                  }}
                  value={this.state.credentials.password}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Image
                    source={birthdayIcon}
                    style={styles.inputIcon}
                    resizeMode="contain"
                  />
                </View>

                <DatePicker
                  style={[styles.DatePicker]}
                  date={this.state.credentials.birthday}
                  mode="date"
                  placeholder="Birthday"
                  format="MM-DD-YYYY"
                  maxDate={new Date()}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  showIcon={false}
                  customStyles={{
                    dateInput: {
                      borderWidth: 0
                    }
                  }}
                  onDateChange={(birthday) => {this.updateCredentials(
                    this.state.credentials.name,
                    this.state.credentials.email,
                    this.state.credentials.password,
                    birthday)
                  }}
                />

              </View>

              <TouchableOpacity onPress={this.createUser.bind(this)}>
                <View style={styles.signup}>
                  <Text style={styles.whiteFont}>Join</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={{paddingBottom: 40}}>
                <View style={styles.signin}>
                  <Text style={styles.greyFont}>Already have an account?
                  <Text
                  style={styles.signupLinkText}
                  onPress={() => {
                    this.props.navigator.push({
                      name: 'login'
                    });
                  }}
                  > Sign In</Text></Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Image>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    paddingTop: 30,
    width: null,
    height: null
  },
  headerContainer: {
    flex: 1,
  },
  inputsContainer: {
    flex: 3
  },
  footerContainer: {
    flex: 1
  },
  headerIconView: {
    marginLeft: 10,
    backgroundColor: 'transparent'
  },
  headerBackButtonView: {
    width: 25,
    height: 25,
  },
  backButtonIcon: {
    width: 25,
    height: 25
  },
  headerTitleView: {
    backgroundColor: 'transparent',
    marginTop: 25,
    marginLeft: 10,
  },
  titleViewText: {
    fontSize: 30,
    color: '#fff',
  },
  inputs: {
    paddingVertical: 20
  },
  inputContainer: {
    flexDirection: "row",
    marginVertical: 10,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC"
  },
  iconContainer: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputIcon: {
    height: 20,
    width: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  DatePicker: {
    flex: 1
  },
  signup: {
    backgroundColor: '#FF3366',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30
  },
  signin: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  greyFont: {
    color: '#D8D8D8'
  },
  whiteFont: {
    color: '#FFF',
    fontSize: 18
  },
  signupLinkText: {
    color: "#FFF",
    marginLeft: 5,
    fontWeight: 'bold'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  thumbnail: {
    width: 73,
    height: 73,
    borderWidth: 1,
    borderColor: '#DDD',
    margin: 5,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20
  },
  imageWrap: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImg: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textPic:{
    paddingTop: 10,
    color: '#FFF',
    textAlign: 'center'
  },
})
