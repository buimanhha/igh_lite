import React, {Component, useEffect, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {Overlay} from 'react-native-elements';
import {Thumbnail} from 'native-base';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

let unsubscribe = null;

class InternetNotice extends Component {
  state = {
    isConnected: true,
    showNotice: false,
  };

  OfflineNotice = () => {
    return (
      <Overlay
        height="auto"
        isVisible={this.state.showNotice}
        overlayBackgroundColor="#fff"
        overlayStyle={{
          borderRadius: 10,
          elevation: 0,
          shadowOpacity: 0,
          paddingLeft: moderateScale(10),
          paddingRight: moderateScale(10),
        }}>
        <Image
          style={{
            height: moderateScale(150),
            width: moderateScale(150),
            alignSelf: 'center',
          }}
          source={require('../global/asset/icon/errorConnect.png')}
        />
        <Text style={styles.titleText}>Lỗi kết nối internet</Text>
        <Text style={styles.contentText}>
          Bật dữ liệu di động hoặc kết nối Wi-Fi để sử dụng
        </Text>
        {/* <View style={styles.overlayLineHorizonal} />
        <TouchableOpacity
          style={styles.overlayButtonOnlyOne}
          onPress={() => {
            this.setState({showNotice: false});
          }}>
          <Text style={styles.overlayText}>Đóng</Text>
        </TouchableOpacity> */}
      </Overlay>
    );
  };

  handleConnectivityChange = isConnected => {
    console.log('value=' + this.state.showNotice);
    this.setState({showNotice: !isConnected, isConnected: isConnected});
  };

  componentDidMount() {
    NetInfo.fetch().then(state => {
      unsubscribe = NetInfo.addEventListener(state => {
        this.handleConnectivityChange(state.isConnected);
      });
    });
  }

  componentWillUnmount() {
    if (unsubscribe !== null) {
      unsubscribe();
    }
  }

  render() {
    if (!this.state.isConnected) {
      return this.OfflineNotice();
    }
    return null;
  }
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#ff7575',
    textAlign: 'left',
    marginBottom: moderateScale(5),
  },
  contentText: {
    fontSize: moderateScale(16),
    textAlign: 'left',
  },
  //style for overlay
  overlay: {
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
  },
  overlayContainer: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: moderateScale(10),
  },
  overlayLineHorizonal: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    flex: 1,
    opacity: 0.2,
  },
  overlayButtonOnlyOne: {
    textAlign: 'justify',
    alignSelf: 'center',
  },
  overlayText: {
    color: '#2f59a7',
    textAlign: 'left',
    alignSelf: 'center',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});

export default InternetNotice;
