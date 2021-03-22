import React, { Component, PropTypes } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const menuList = require('./Constants.js');

export default class Menu extends Component {
  render() {
    return (
      <View style={styles.wrapper}>
        <ScrollView>
          {menuList.MENU_LIST.map(item => (
            <TouchableOpacity
              key={item.index}
              onPress={() => console.log('entered menu')}
            >
              <Text style={styles.listMenu}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'grey',
    marginTop: 50,

  },

  listMenu: {
    color: 'white', 
    fontSize: 16, 
    paddingLeft: 20, 
    paddingTop: 12,
    paddingBottom: 12,
  }

});