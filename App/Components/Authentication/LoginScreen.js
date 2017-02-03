'use strict'

import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  Button,
  TouchableOpacity
} from 'react-native';

var uuid = require('react-native-uuid');

const { width, height } = Dimensions.get("window");
const background = require("./images/login1_bg.png");
const mark = require("./images/login1_mark.png");
const lockIcon = require("./images/login1_lock.png");
const personIcon = require("./images/login1_person.png");

export default class LoginScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      credentials: {'email':'', 'password': ''}
    };
    this.getSessionStatus();
  }
  componentWillMount(){
    if(this.props.info){
      this.setState({
        credentials: {'email':this.props.info.local.email, 'password': ''}
      });
    }
    this.props.hideNav();
  }
  componentDidMount(){
    console.log(this.props.info);
    console.log('mounted login')
  }
  getSessionStatus() {
    var that = this;
    fetch(this.props.server+'/session',{
      method: 'GET'
    }).then(function(response) {
        if(response.status == 200){
          return response.json();
        }
        else{
          Alert.alert(
            'Server Error',
            'Something went wrong on api server!',
          )
          //throw new Error('Something went wrong on api server!');
        }
    }).then(function(session) {
      if(session.active){
        that.props.updateUser(session.user);
        that.props.navigator.resetTo({
          name: 'home'
        });
      }
      console.log(session);
    }).catch(function(error) {
      console.error(error);
    });
  }
  updateCredentials(email, password) {
    var credentials = Object.assign(this.state.credentials, {'email':email.trim(), 'password':password});
    this.setState(credentials);
  }
  signIn(){
    var credentials = this.state.credentials;
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
    else {
      // data validated
      var that = this;

      fetch(this.props.server+'/signin',{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }).then(function(response) {
          if(response.status == 200){
            return response.json();
          }
          else{
            Alert.alert(
              'Server Error',
              'Something went wrong on api server!',
            )
            //throw new Error('Something went wrong on api server!');
          }
      }).then(function(response) {
          console.log(response);
          if(response.success === false && response.info.verified === false){
            Alert.alert(
              'Waiting For Email Verification',
              response.info.message,
              [{text: 'Verify', onPress: () => {
                that.props.navigator.push({
                email: response.info.email,
                name: 'verification'
              })} }]
            )
          }
          else if(response.success === false  && response.info.verified === true){
            Alert.alert(
              'Incorrect Email Or Password',
              response.info.message,
            )
          }
          else{
            that.props.saveInfo(response.user);
            that.props.updateUser(response.user);
            that.props.navigator.resetTo({
              name: 'home'
            });
          }
      }).catch(function(error) {
          console.error(error);
      });
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <Image source={background} style={styles.background} resizeMode="cover">
          <View style={styles.markWrap}>
            <Image source={mark} style={styles.mark} resizeMode="contain" />
          </View>
          <View style={styles.wrapper}>
            <View style={styles.inputWrap}>
              <View style={styles.iconWrap}>
                <Image source={personIcon} style={styles.icon} resizeMode="contain" />
              </View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#FFF"
                style={styles.input}
                value={this.state.credentials.email}
                onChangeText={(email) => this.updateCredentials(email, this.state.credentials.password)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputWrap}>
              <View style={styles.iconWrap}>
                <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
              </View>
              <TextInput
                placeholderTextColor="#FFF"
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={this.state.credentials.password}
                onChangeText={(password) => this.updateCredentials(this.state.credentials.email, password)}
              />
            </View>
            <TouchableOpacity activeOpacity={.5}
              onPress={
                () => {
                  this.props.navigator.push({
                    name: 'resetpassword'
                  })
                }
              }>
              <View>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={.5} onPress={this.signIn.bind(this)} >
              <View style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            <View style={styles.signupWrap}>
              <Text style={styles.accountText}>{"Don't have an account?"}</Text>
              <TouchableOpacity activeOpacity={.5}>
                <View>
                  <Text style={styles.signupLinkText}
                  onPress={() => {
                    this.props.navigator.push({
                      name: 'signup'
                    });
                  }}
                  >Sign Up</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
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
  }
});
