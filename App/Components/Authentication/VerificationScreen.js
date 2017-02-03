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

export default class VerificationScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      credentials: {'code': ''}
    };
  }
  componentDidMount(){
    var that = this;
    that.props.socket.on('User Verified', function(user){
      console.log('User Verified');
      that.props.updateUser(user);
        that.props.navigator.resetTo({
          name: 'home'
        });
    });

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
      fetch(this.props.server+'/emailconfirm/'+credentials.code ,{
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
          console.log(response);
          if(!response.success){
            Alert.alert(
              'Invalid Code',
              'Please enter a valid code.',
            )
          }
          else{
            that.props.updateUser(response.user);
            that.props.navigator.push({
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
                <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
              </View>
              <TextInput
                placeholder="Enter Verification Code"
                placeholderTextColor="#FFF"
                style={styles.input}
                value={this.state.credentials.code}
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
          <View style={styles.container}>
            <View style={styles.signupWrap}>
              <Text style={styles.accountText}>{"Didn't get the code?"}</Text>
              <TouchableOpacity activeOpacity={.5}>
                <View>
                  <Text style={styles.signupLinkText}
                  onPress={() => {
                    this.props.navigator.push({
                      name: 'signup'
                    });
                  }}
                  >Resend</Text>
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
