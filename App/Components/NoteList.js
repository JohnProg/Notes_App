'use strict'

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight
  } from 'react-native';

export default class NoteList extends React.Component {

  constructor (props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  }
  _onPress (rowData) {
  this.props.navigator.push(
    {
      name: 'createNote',
      note: {
        id: rowData.id,
        title: rowData.title,
        body: rowData.body
      }
    });
  }
  render() {
    return (
      <ListView
        dataSource={this.ds.cloneWithRows(this.props.notes)}
        renderRow={(rowData) => {
              return (
            <TouchableHighlight
              onPress={() => this.props.onSelectNote(rowData)}
              style={styles.rowStyle}
              underlayColor="#9E7CE3"
            >
              <Text style={styles.rowText}>{rowData.title}</Text>
            </TouchableHighlight>              )
            }
      }/>
    )
  }
}

var styles = StyleSheet.create({
  rowStyle: {
    borderBottomColor: '#FF4081',
    borderBottomWidth: 1,
    padding: 20,
  },
  rowText: {
    fontWeight: '600'
  }
});
//onPress={() => console.log(rowData)}
