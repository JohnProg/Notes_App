'use strict';

import React, { Component } from 'react';
import {
  Alert,
  Platform,
  Dimensions,
  Navigator,
  NetInfo,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';

import {GiftedChat, Actions, Bubble} from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import CustomView from './CustomView';

var uuid = require('react-native-uuid');
var RNUploader = require('NativeModules').RNUploader;

const RNFS = require('react-native-fs');

export default class ChatScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,

      uploading: false,

      uploadProgress: 0,
      uploadTotal: 0,
      uploadWritten: 0,
      uploadStatus: undefined,
      cancelled: false,
    };

    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    //this.onReceive = this.onReceive.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);

    this._isAlright = null;
  }
  componentWillMount() {
    this._isMounted = false;

    var that = this;
    fetch(this.props.server+'/messages',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: this.props.user.local.email})
    }).then(function(response){
        var contentType = response.headers.get("content-type");
        if(response.status == 200 && contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function(response) {
            if(response){
              console.log(response.messages);
              //that.props.saveMessages(response.messages);
              that.setState({
                messages: response.messages.reverse()
              });
            }
          });
        } else {
          console.log("Oops, we haven't got JSON!");
          //throw new Error('Something went wrong on api server!');
        }
    }).catch(function(error) {
        console.log(error);
    });
  }

  componentDidMount(){
    this._isMounted = true;
    var that = this;
    this.props.socket.on('message', function (message) {
      // if(message.image){
      //   downloadFile(message.id, that.props.server+'/uploads/users/'+message.user.email+'/'+message._id+'.png');
      // }
      that.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, message),
        };
      });
    });
    console.log('chat component mounted');

    // upload progress
    DeviceEventEmitter.addListener('RNUploaderProgress', (data) => {
      let bytesWritten = data.totalBytesWritten;
      let bytesTotal   = data.totalBytesExpectedToWrite;
      let progress     = data.progress;
      this.setState({uploadProgress: progress, uploadTotal: bytesTotal, uploadWritten: bytesWritten});
    });
  }

  componentWillUnmount() {
      console.log('chat unmaunted');
  }

  onLoadEarlier() {
    this.setState((previousState) => {
      return {
        isLoadingEarlier: true,
      };
    });

    setTimeout(() => {
      if (this._isMounted === true) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.prepend(previousState.messages, require('./data/old_messages.js')),
            loadEarlier: false,
            isLoadingEarlier: false,
          };
        });
      }
    }, 1000); // simulating network
  }

  downloadFile(fileName, url) {
    const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/headers.json';

    const progress = data => {
      const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
      const text = `Progress ${percentage}%`;
      this.setState({ output: text });
    };

    // Random file name needed to force refresh...
    const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}.png`;

    console.log('Destination: '+ downloadDest);

    const ret = RNFS.downloadFile({ fromUrl: url, toFile: downloadDest});

    ret.promise.then(res => {
      console.log(JSON.stringify(res));
      console.log(ret.jobId);
    }).catch(err => {
      console.log(err);
    });
  }

  _uploadImages(filePath, message) {
    let files = [{
      name: 'file',
      filename: message._id+'.png',
      filepath: filePath,
      filetype: 'image/png',
    }];

    let opts = {
      url: this.props.server+'/userupload',
      method: 'POST',
      files: files,
      params: {user: this.props.user.local.email}
    };

    this.setState({ uploading: true, });
    RNUploader.upload(opts, (err, res) => {
      if (err) {
        console.log(err);
        return err;
      }

      let status = res.status;
      let responseString = res.data;

      console.log('Upload complete with status ' + status);
      console.log(responseString);

      this.setState({uploading: false, uploadStatus: status});

      this.props.socket.emit('chat message', message);
      return;
    });
  }

  onSend(messages = []) {
    var that     = this;
    var message  = messages[messages.length-1];
    var filePath = message.image;
    console.log(message);

    if(message.image){
      var fileName  = message._id;
      message.image = this.props.server+'/uploads/users/'+message.user.email+'/'+message._id+'.png';
      console.log(message.image);

      that._uploadImages(filePath, message);

    }
    else{
      this.props.socket.emit('chat message', message);
    }
    //this.answerDemo(messages);
  }

  // onReceive(text) {
  //   this.setState((previousState) => {
  //     return {
  //       messages: GiftedChat.append(previousState.messages, {
  //         _id: Math.round(Math.random() * 1000000),
  //         text: text,
  //         createdAt: new Date(),
  //         user: {
  //           _id: 2,
  //           name: 'React Native',
  //           // avatar: 'https://facebook.github.io/react/img/logo_og.png',
  //         },
  //       }),
  //     };
  //   });
  // }

  renderCustomActions(props) {
    if (Platform.OS === 'ios') {
      return (
        <CustomActions
          {...props}
        />
      );
    }
    const options = {
      'Action 1': (props) => {
        alert('option 1');
      },
      'Action 2': (props) => {
        alert('option 2');
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderCustomView(props) {
    return (
      <CustomView
        {...props}
      />
    );
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  }

  // answerDemo(messages) {
  //   if (messages.length > 0) {
  //     if ((messages[0].image || messages[0].location) || !this._isAlright) {
  //       this.setState((previousState) => {
  //         return {
  //           typingText: 'React Native is typing'
  //         };
  //       });
  //     }
  //   }
  //
  //   setTimeout(() => {
  //     if (this._isMounted === true) {
  //       if (messages.length > 0) {
  //         if (messages[0].image) {
  //           this.onReceive('Nice picture!');
  //         } else if (messages[0].location) {
  //           this.onReceive('My favorite place');
  //         } else {
  //           if (!this._isAlright) {
  //             this._isAlright = true;
  //             this.onReceive('Alright');
  //           }
  //         }
  //       }
  //     }
  //
  //     this.setState((previousState) => {
  //       return {
  //         typingText: null,
  //       };
  //     });
  //   }, 1000);
  // }

  render () {
    return (
      <View style={{
          flex: 1,
          marginTop: 60,
        }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend.bind(this)}

          user={{
            _id: this.props.user._id,
            name: this.props.user.local.name,
            avatar: this.props.user.local.avatar,
            email: this.props.user.local.email,
          }}

          loadEarlier={this.state.loadEarlier}
          onLoadEarlier={this.onLoadEarlier}
          isLoadingEarlier={this.state.isLoadingEarlier}
          isAnimated = {true}
          renderActions={this.renderCustomActions}
          renderBubble={this.renderBubble}
          renderCustomView={this.renderCustomView}
          renderFooter={this.renderFooter}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
});
