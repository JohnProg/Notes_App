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

export default class AccountScreen extends Component {
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
      image: {uri: this.props.user.local.avatar, width: 100, height: 100},
      credentials: {
        'username': this.props.user.local.email,
        'name': this.props.user.local.name,
        'email': this.props.user.local.email,
        'password': '',
        'newPassword': '',
        'confirmNewPassword': '',
        'birthday': this.props.user.local.birthday}
    };
  }
  componentDidMount(){
    console.log('avatar source: '+this.props.user.local.avatar);
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
  updateCredentials(name, email, password, newPassword, confirmNewPassword, birthday) {
    var credentials = Object.assign(this.state.credentials, {
      'username': this.props.user.local.email,
      'name':name,
      'email':email.trim(),
      'password':password,
      'newPassword':newPassword,
      'confirmNewPassword':confirmNewPassword,
      'birthday':birthday
    });
    this.setState(credentials);
  }
  updateUser(){
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
    else if(credentials.newPassword !== '' && !validatePassword(credentials.newPassword)){
      Alert.alert(
        'Invalid New Password',
        'Password must have at least 6 characters incuding 1 capital letter, 1 lowercase letter and 1 number.',
      )
    }
    else if(credentials.confirmNewPassword !== '' && !validatePassword(credentials.confirmNewPassword)){
      Alert.alert(
        'Invalid New Password Confirmation',
        'Password must have at least 6 characters incuding 1 capital letter, 1 lowercase letter and 1 number.',
      )
    }
    else if(credentials.newPassword !== '' && credentials.confirmNewPassword !== '' && credentials.newPassword !== credentials.confirmNewPassword){
      Alert.alert(
        'Passwords do not match',
        'Make sure you type the same exact password in both inputs.',
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
    }
    else if (credentials.name === this.props.user.local.name &&
        credentials.birthday === this.props.user.local.birthday &&
        credentials.email === this.props.user.local.email &&
        credentials.newPassword === '' &&
        credentials.confirmNewPassword === '' &&
        this.state.image.uri == this.props.user.local.avatar
    ) {
      Alert.alert(
        "No Changes",
        "You haven't made any changes.",
      )
    }
    else {
      var that = this;
      // data validated
      fetch(this.props.server+'/accountupdate',{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }).then(function(response) {
          if(response.status == 200){
            if(that.state.image.uri !== that.props.user.local.avatar){
              that._uploadImages();
            }
            return response.json();
          }
          else{
            throw new Error('Something went wrong on api server!');
          }
      }).then(function(response) {
          console.log(response);
          if(response.info.success){
            if(credentials.newPassword !== '' || credentials.email !== credentials.username){
              that.props.updateUser(response.user);
              Alert.alert(
                'You Have successfully Updated Your Information',
                'Please login with the new credentials to verify the changes.',
                [{text: 'Verify Changes', onPress: () => {
                  that.props.navigator.resetTo({
                  name: 'login'
                })} }]
              )
            }
            else{
              that.props.updateUser(response.user);
              Alert.alert(
                'Your Information has been updated',
                'All changes made have been applied to your account',
              )
            }
          }
          else if(!response.info.success){
            Alert.alert(
              'There Was a problem',
              response.info.message,
            )
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

            <View style={styles.inputsContainer}>
              <View style={styles.headerContainer}>
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => this.pickSingle(true, true)}>
                    <View style={styles.imageWrap}>
                      <Image source={this.state.image} style={styles.profileImg} resizeMode="contain" />
                    </View>
                    <Text style={styles.textPic}>
                      Change Profile Picture
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                    this.state.credentials.newPassword,
                    this.state.credentials.confirmNewPassword,
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
                    this.state.credentials.newPassword,
                    this.state.credentials.confirmNewPassword,
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
                  placeholder="Current Password"
                  placeholderTextColor="#FFF"
                  onChangeText={(password) => {this.updateCredentials(
                    this.state.credentials.name,
                    this.state.credentials.email,
                    password,
                    this.state.credentials.newPassword,
                    this.state.credentials.confirmNewPassword,
                    this.state.credentials.birthday)
                  }}
                  value={this.state.credentials.password}
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
                  placeholder="Enter New Password"
                  placeholderTextColor="#FFF"
                  onChangeText={(newPassword) => {this.updateCredentials(
                    this.state.credentials.name,
                    this.state.credentials.email,
                    this.state.credentials.password,
                    newPassword,
                    this.state.credentials.confirmNewPassword,
                    this.state.credentials.birthday)
                  }}
                  value={this.state.credentials.newPassword}
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
                  placeholder="Re-Enter New Password"
                  placeholderTextColor="#FFF"
                  onChangeText={(confirmNewPassword) => {this.updateCredentials(
                    this.state.credentials.name,
                    this.state.credentials.email,
                    this.state.credentials.password,
                    this.state.credentials.newPassword,
                    confirmNewPassword,
                    this.state.credentials.birthday)
                  }}
                  value={this.state.credentials.confirmNewPassword}
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
                    this.state.credentials.newPassword,
                    this.state.credentials.confirmNewPassword,
                    birthday)
                  }}
                />

              </View>

            </View>
            <View style={styles.container}>
              <TouchableOpacity onPress={this.updateUser.bind(this)}>
                <View style={styles.signup}>
                  <Text style={styles.whiteFont}>Update Information</Text>
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
    marginTop: 55,
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
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
