import React, {Component} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import cssStyle from '../../global/asset/css/cssStyle';
import {Actions} from 'react-native-router-flux';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

const deviceW = Dimensions.get('window').width;

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

  state = {
    scrollEnabled: true,
    lastScrollEvent: '',
  };

  _onScroll = event => {
    this.setState({lastScrollEvent: JSON.stringify(event.nativeEvent)});
  };

  buildContentHtml = content => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=${Number(
          deviceW,
        )}, user-scalable=no">
        ${cssStyle}
      </head>
      <body>
      ${content}
      </body>
    </html>
    `;
  };

  render() {
    let url = this.props.url;
    let content = this.props.content;
    if (url != null && url !== '') {
      return (
        <WebView
          startInLoadingState
          source={{uri: url}}
          renderLoading={() => {
            return (
              <ActivityIndicator
                size="large"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            );
          }}
        />
      );
    } else if (content != null && content !== '') {
      let contentHtml = this.buildContentHtml(content);
      return (
        <WebView
          source={{
            html: contentHtml,
            ...Platform.select({
              //padding top equal borderWith, leight equal 2 * frontsize
              ios: {},
              android: {baseUrl: 'file:///android_asset/media/'},
              default: {},
            }),
            // baseUrl: isAndroid
            //   ? 'file:///android_asset/media/'
            //   : '',
          }}
          onScroll={this._onScroll}
          automaticallyAdjustContentInsets={true}
          scrollEnabled={true}
        />
      );
    } else {
      return (
        <WebView
          source={{uri: 'https://www.hoanglongclinic.vn/vi/'}}
          renderLoading={() => {
            return (
              <ActivityIndicator
                size="large"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            );
          }}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  errorForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    height: 90,
    width: 90,
    alignSelf: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    color: '#2C7770',
  },
});
