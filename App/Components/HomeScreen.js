'use strict'

var uuid = require('react-native-uuid');

import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View
} from 'react-native';

import HomeButton from './HomeButton';
import NoteList from './NoteList';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

export default class HomeScreen extends React.Component {
  constructor (props) {
    super(props);
    this.props.socket.emit('user', this.props.user.local.email);
  }
  componentWillMount(){
    this.props.showNav();
  }
  render () {
    var notes = false;
    if(this.props.notes.length > 0 ){
      notes = true;
    }
    return (
      <View style={styles.container}>

        {notes ? <NoteList notes={this.props.notes} onSelectNote={this.props.onSelectNote}/> : null}

        {!notes ? <HomeButton text={"You haven't created any notes!"} navigator={this.props.navigator} /> : null}

        <ActionButton buttonColor="#FF4081">

          <ActionButton.Item buttonColor='#1abc9c' title="Sign Out" onPress={() => {
            Alert.alert(
              'Sign Out?',
              'Please select Yes or No.',
              [
                {text: 'Yes', onPress: () => {
                    var that = this;
                    fetch(this.props.server+'/logout',{
                      method: 'GET'
                    }).then(function(response) {
                        if(response.status == 200){
                          return response.json();
                        }
                        else{
                          throw new Error('Something went wrong on api server!');
                        }
                    }).then(function(response) {
                        that.props.removeUser();
                        that.props.navigator.push({
                          name: 'login'
                        });
                        console.log(response);
                    }).catch(function(error) {
                        console.error(error);
                    });
                  }
                },
                {text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel'}
              ]
            )
          }}>
            <Icon name="md-log-out" style={styles.actionButtonIcon} />
          </ActionButton.Item>

          <ActionButton.Item buttonColor='#9b59b6' title="New Note"
          onPress={() => {
            this.props.navigator.push({
              name: 'createNote',
              note: {
                id: uuid.v1(),
                title: '',
                body: ''
              }
            });
          }}
          >
            <Icon name="md-create" style={styles.actionButtonIcon} />
          </ActionButton.Item>

          <ActionButton.Item buttonColor='#3498db' title="Chat"
            onPress={() => {
              this.props.navigator.push({
                name: 'chat'
              });
            }}>
            <Icon name="ios-chatbubbles" style={styles.actionButtonIcon} />
          </ActionButton.Item>

          <ActionButton.Item buttonColor='#CDDC39' title="My Account"
            onPress={() => {
              this.props.navigator.push({
                user: this.props.user,
                name: 'account'
              });
            }}
          >
            <Icon name="md-settings" style={styles.actionButtonIcon} />
          </ActionButton.Item>

        </ActionButton>

      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 65
  },
  actionButtonIcon: {
    fontSize: 25,
    height: 22,
    color: 'white',
  }
});
