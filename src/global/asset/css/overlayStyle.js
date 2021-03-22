import React, {Component, PropTypes} from 'react';
import {StyleSheet, Dimensions, PixelRatio} from 'react-native';

const deviceW = Dimensions.get('window').width;
const deviceH = Dimensions.get('window').height;
const screenRate = deviceW / 430;
var overlaystyle = StyleSheet.create({
  // style for overlay
  overlay: {
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: deviceW,
  },

  overlayContainer: {
    borderRadius: 20 * screenRate,
    backgroundColor: 'white',
    padding: 10 * screenRate,
  },

  overlayHeaderText: {
    fontWeight: '500',
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 20 * screenRate,
    margin: 10 * screenRate,
    fontWeight: 'bold',
    // paddingBottom: 40,
  },

  overlayContentText: {
    fontWeight: '500',
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 18 * screenRate,
    margin: 10 * screenRate,
    // paddingBottom: 40,
  },

  overlayButtonOnlyOne: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: 5 * screenRate,
    flex: 1,
  },

  overlayButton: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: 5 * screenRate,
    flex: 0.5,
  },

  overlayTextNormal: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 18 * screenRate,
    fontWeight: 'normal',
  },

  overlayText: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 18 * screenRate,
    fontWeight: 'bold',
  },

  overlayLineHorizonal: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    flex: 1,
    opacity: 0.2,
  },

  overlayLineVertical: {
    borderLeftWidth: 1,
    borderLeftColor: 'black',
    opacity: 0.2,
  },

  overlayRowDirection: {
    flexDirection: 'row',
    alignContent: 'space-around',
  },
});

module.exports = overlaystyle;
