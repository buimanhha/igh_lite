import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

const reporter = async error => {
  let userInfo = await StorageUtils.getJsonData('userInfo');
  Log.putException({
    username:
      userInfo == null
        ? 'not login'
        : userInfo.patient_id + '|' + userInfo.telephone,
    action: '',
    location: Actions.currentScene,
    content: error.message,
    created_date: new Date(),
  });
};

const errorHandler = (e, isFatal) => {
  if (isFatal) {
    reporter(e);
    Alert.alert('Lỗi hệ thống', 'Xin vui lòng khởi động lại ứng dụng !', [
      {
        text: 'Khởi động lại',
        onPress: () => {
          RNRestart.Restart();
        },
      },
    ]);
  }
};

setJSExceptionHandler(errorHandler, true);

export default class News extends Component {
  openCategory = () => {
    Actions.category();
  };

  openYoutube = () => {
    // console.log('cal open youtube');
    Linking.openURL(
      'https://www.youtube.com/channel/UCTMegdGcd4D9RTc1-r8h1xg',
    ).catch(err => console.error('An error occurred', err));
    // console.log('end open youtube');
  };

  render() {
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          source={require('../../global/asset/images/background.jpg')}
          style={{width: '100%', height: '100%'}}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.menuRow}>
              <TouchableOpacity onPress={() => this.openCategory()}>
                <Image
                  style={styles.imageButton}
                  source={require('../../global/asset/images/_HuongDanUongThuoc.png')}
                />
                <Text style={styles.titleText}>Danh sách các bài viết</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuRow}>
              <TouchableOpacity onPress={() => this.openYoutube()}>
                <Image
                  style={styles.imageButton}
                  source={require('../../global/asset/images/_CapNhatKienThuc.png')}
                />
                <Text style={styles.titleText}>Thư viện video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  container1: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  containerBody: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerFooter: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    width: 200,
    backgroundColor: '#eeeeee',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#002f6c',
    marginVertical: 10,
  },
  button: {
    width: 120,
    backgroundColor: '#4f83cc',
    borderRadius: 25,
    marginVertical: 10,
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  titleText: {
    textAlign: 'center',
    color: '#2C7770',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonLeftFooter: {
    width: 120,
    backgroundColor: '#4f83cc',
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 12,
    // marginHorizontal: 55,
    // paddingHorizontal: 10,
    position: 'relative',
    bottom: 10,
    left: -70,
  },
  buttonRightFooter: {
    width: 120,
    backgroundColor: '#4f83cc',
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 12,
    position: 'relative',
    bottom: 10,
    right: -70,
    color: '#4f83cc',
  },
  buttonTextRightFooter: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    // position: 'relative',
  },
  imageButton: {
    height: moderateScale(80),
    width: moderateScale(80),
    alignSelf: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    marginVertical: moderateScale(20),
  },
});
