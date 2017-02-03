'use strict'

import React, { Component } from 'react';
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  Button,
  TouchableOpacity
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

var uuid = require('react-native-uuid');

type State = { animating: boolean; };
type Timer = number;

const { width, height } = Dimensions.get("window");
const background = require("./images/login1_bg.png");
const mark = require("./images/login1_mark.png");
const lockIcon = require("./images/login1_lock.png");
const personIcon = require("./images/login1_person.png");
const backIcon = require("./images/back.png");

export default class ResetPasswordScreen extends Component {
  state: State;
  _timer: Timer;
  constructor (props) {
    super(props)
    this.state = {
      code: '',
      animating: false,
      component: 'finduser'
    };
  }
  componentDidMount() {

  }
  toggleLoader() {
    this._timer = setTimeout(() => {
      this.setState({animating: !this.state.animating});
    }, 2000);
  }
  nextStep(component){
    this.setState({
      component: component
    });
  }
  setCode(code){
    this.setState({
      code: code
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Image source={background} style={styles.background} resizeMode="cover">
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

          {(() => {
            switch (this.state.component) {
              case 'finduser':
                return (
                  <FindUser toggleLoader={this.toggleLoader.bind(this)} nextStep={this.nextStep.bind(this)} />
                );
              case 'verifyuser':
                return (
                  <VerifyUser toggleLoader={this.toggleLoader.bind(this)} setCode={this.setCode.bind(this)} nextStep={this.nextStep.bind(this)} />
                );
              case 'changepassword':
               return (
                 <ChangePassword code={this.state.code} toggleLoader={this.toggleLoader.bind(this)} navigator={this.props.navigator} />
               );
            }
          })()}

          <View style={styles.container}>
            <View style={styles.signupWrap}>
              <Text style={styles.accountText}>{"Remembered your password?"}</Text>
              <TouchableOpacity activeOpacity={.5}>
                <View>
                  <Text style={styles.signupLinkText}
                  onPress={() => {
                    this.props.navigator.push({
                      name: 'login'
                    });
                  }}
                  >Log In</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <ActivityIndicator
            animating={this.state.animating}
            style={[styles.centering, {height: 80}]}
            size="large"
            color="white"
          />
        </Image>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markWrap: {
    flex: 1,
    paddingVertical: 30,
  },
  headerIconView: {
    marginLeft: 10,
    backgroundColor: 'transparent'
  },
  headerBackButtonView: {
    marginTop: 30,
    width: 25,
    height: 25,
  },
  backButtonIcon: {
    width: 25,
    height: 25
  },
  mark: {
    width: null,
    height: null,
    flex: 1,
  },
  background: {
    width,
    height,
  },
  wrapper: {
    paddingVertical: 30,
  },
  inputWrap: {
    flexDirection: "row",
    marginVertical: 10,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC"
  },
  iconWrap: {
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: 20,
    width: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: '#FFF'
  },
  button: {
    backgroundColor: "#FF3366",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18
  },
  forgotPasswordText: {
    color: "#D8D8D8",
    backgroundColor: "transparent",
    textAlign: "right",
    paddingRight: 15,
  },
  signupWrap: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: {
    color: "#D8D8D8"
  },
  signupLinkText: {
    color: "#FFF",
    marginLeft: 5,
    fontWeight: 'bold'
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  gray: {
    backgroundColor: '#cccccc',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  bigIcon:{
    textAlign: 'center',
    fontSize: 150,
    color: 'white',
  }
});

class FindUser extends Component {
  constructor (props) {
    super(props)
    this.state = {
      credentials: {'email': ''}
    };
  }
  updateCredentials(email) {
    var credentials = Object.assign(this.state.credentials, {'email': email.trim()});
    this.setState(credentials);
  }
  findUser(){
    var credentials = this.state.credentials;

    var validateEmail = (email) => {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };

    console.log(credentials);
    if (!validateEmail(credentials.email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email.',
      )
    }
    else {
      var that = this;
      // data validated
      that.props.toggleLoader();
      fetch(this.props.server+'/passwordrecovery',{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }).then(function(response) {
          if(response.status == 200) return response.json();
          else {
            that.props.toggleLoader();
            throw new Error('Something went wrong on api server!');
          };
      }).then(function(response) {
          that.props.toggleLoader();
          console.log(response);
          if(!response.success){
            Alert.alert(
              'No User Found',
              'Please enter a valid email.',
            )
          }
          else{
            that.props.nextStep('verifyuser');
          }
      }).catch(function(error) {
          console.error(error);
      });
    }
  }
  render(){
    return(
      <View style={styles.wrapper}>
        <Icon name="ios-unlock-outline" style={styles.bigIcon} />
        <View style={styles.inputWrap}>
          <View style={styles.iconWrap}>
            <Image source={personIcon} style={styles.icon} resizeMode="contain" />
          </View>
          <TextInput
            placeholder="Enter Your Email"
            placeholderTextColor="#FFF"
            style={styles.input}
            value={this.state.credentials.email}
            onChangeText={(email) => this.updateCredentials(email)}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity activeOpacity={.5} onPress={this.findUser.bind(this)}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Find Me</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

class VerifyUser extends Component {
  constructor (props) {
    super(props)
    this.state = {
      credentials: {'code': ''}
    };
  }
  componentDidMount(){
    Alert.alert(
      'Email Verification',
      'Please enter the verification code that was sent to '+this.props.email,
    )
  }
  updateCredentials(code) {
    var credentials = Object.assign(this.state.credentials, {'code': code.trim()});
    this.setState(credentials);
  }
  verifyUser(){
    var credentials = this.state.credentials;
    console.log(credentials);
    if (!credentials.code) {
      Alert.alert(
        'Invalid Code',
        'Please enter a valid code.',
      )
    }
    else {
      var that = this;
      // data validated
      that.props.toggleLoader();
      fetch(this.props.server+'/verifyuser/'+credentials.code ,{
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }).then(function(response) {
          if(response.status == 200) return response.json();
          else {
            throw new Error('Something went wrong on api server!');
          };
      }).then(function(response) {
          that.props.toggleLoader();
          console.log(response);
          if(!response.success){
            Alert.alert(
              'Invalid Code',
              'Please enter a valid code.',
            )
          }
          else{
            that.props.setCode(credentials.code);
            that.props.nextStep('changepassword');
          }
      }).catch(function(error) {
          console.error(error);
      });
    }
  }
  render(){
    return(
      <View style={styles.wrapper}>
        <Icon name="ios-key-outline" style={styles.bigIcon} />
        <View style={styles.inputWrap}>
          <View style={styles.iconWrap}>
            <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
          </View>
          <TextInput
            placeholder="Enter The Verification Code"
            placeholderTextColor="#FFF"
            style={styles.input}
            value={this.state.credentials.email}
            onChangeText={(code) => this.updateCredentials(code)}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity activeOpacity={.5} onPress={this.verifyUser.bind(this)}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

class ChangePassword extends Component {
  constructor (props) {
    super(props)
    this.state = {
      credentials: {
        'newPassword': '',
        'confirmNewPassword': ''
      }
    };
  }
  updateCredentials(newPassword, confirmNewPassword) {
    var credentials = Object.assign(this.state.credentials, {
      'newPassword': newPassword,
      'confirmNewPassword': confirmNewPassword
    });
    this.setState(credentials);
  }
  changePassword(){
    var credentials = this.state.credentials;
    console.log(credentials);
    var validatePassword = (password) => {
      var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      return re.test(password);
    };

    if (!validatePassword(credentials.newPassword) || !validatePassword(credentials.confirmNewPassword)){
      Alert.alert(
        'Invalid New Password',
        'Password must have at least 6 characters incuding 1 capital letter, 1 lowercase letter and 1 number.',
      )
    }
    else if (credentials.newPassword !== credentials.confirmNewPassword) {
      Alert.alert(
        'Passwords do not match',
        'Make sure you type the same exact password in both inputs.',
      )
    }
    else {
      var that = this;
      // data validated
      that.props.toggleLoader();
      fetch(this.props.server+'/changepassword/'+that.props.code,{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }).then(function(response) {
          if(response.status == 200) return response.json();
          else {
            throw new Error('Something went wrong on api server!');
          };
      }).then(function(response) {
          that.props.toggleLoader();
          console.log(response);
          if(!response.success){
            Alert.alert(
              'Invalid Code',
              'Please enter a valid code.',
            )
          }
          else{
            Alert.alert(
              'You Have successfully Changed Your Password',
              'Please login with the new password to verify the changes.',
              [{text: 'Verify Changes', onPress: () => {
                that.props.navigator.push({
                name: 'login'
              })} }]
            )
          }
      }).catch(function(error) {
          console.error(error);
      });
    }
  }
  render(){
    return(
      <View style={styles.wrapper}>
        <Icon name="ios-settings-outline" style={styles.bigIcon} />
        <View style={styles.inputWrap}>
          <View style={styles.iconWrap}>
            <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
          </View>
          <TextInput
            secureTextEntry={true}
            style={styles.input}
            placeholder="Enter New Password"
            placeholderTextColor="#FFF"
            onChangeText={(newPassword) => {this.updateCredentials(
              newPassword,
              this.state.credentials.confirmNewPassword
            )}}
            value={this.state.credentials.newPassword}
          />
        </View>
        <View style={styles.inputWrap}>
          <View style={styles.iconWrap}>
            <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
          </View>
          <TextInput
            secureTextEntry={true}
            style={styles.input}
            placeholder="Re-Enter New Password"
            placeholderTextColor="#FFF"
            onChangeText={(confirmNewPassword) => {this.updateCredentials(
              this.state.credentials.newPassword,
              confirmNewPassword
            )}}
            value={this.state.credentials.confirmNewPassword}
          />
        </View>
        <TouchableOpacity activeOpacity={.5} onPress={this.changePassword.bind(this)}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Change Password</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}
