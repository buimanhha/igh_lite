import React, {Component} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

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

export default class Information extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('props.url:' + this.props.url);
    if (this.props.url != null) {
      return <WebView source={{uri: this.props.url}} />;
    } else {
      return <WebView source={{uri: 'https://www.hoanglongclinic.vn/vi/'}} />;
    }
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
  // container2: {
  //   flexDirection: 'column',
  //   justifyContent: 'flex-end',
  //   alignItems: 'flex-end',
  //   flex: 0.1,
  // },
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
    height: 80,
    width: 80,
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: '40%',
    // marginBottom: 0,
    marginRight: '40%',
    marginTop: '20%',
  },
});
