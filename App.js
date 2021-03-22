import React, {Component, useEffect} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  TouchableHighlight,
  Image,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
// import { Icon } from 'react-native-elements'
import {Button, Header} from 'react-native-elements';
import SplashScreen from 'react-native-splash-screen';
import {Provider} from 'react-redux';
import store from './src/redux/stores';
import InternetNotice from './src/components/InternetNotice';
import Routes from './src/Routes';
//import RNNotificationService from './RNNotificationService';
import {white} from './src/global/styles/colors';

import {Actions} from 'react-native-router-flux';

import NotifService from './src/services/NotifService';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import * as PatientController from './src/controller/PatientController';
import * as NotifyUtils from './src/global/utils/NotifyUtils';
import * as StorageUtils from './src/global/utils/StorageUtils';

//background thread
import BackgroundFetch from 'react-native-background-fetch';
import * as Constants from './src/global/constants';
import * as actions from './src/redux/actions';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'home',
    };
    this.notif = new NotifService(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
  }

  componentDidMount() {
    // Configure it.
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        // Android options
        stopOnTerminate: true,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
        requiresCharging: false, // Default
        requiresDeviceIdle: false, // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false, // Default
      },
      async () => {
        console.log('[js] Received background-fetch event');
        //done fetch profile
        {
          if (
            store.getState().regimenPatientInfo != null &&
            store.getState().regimenPatientInfo != undefined &&
            store.getState().regimenPatientInfo.regimenPatientInfo != null &&
            store.getState().regimenPatientInfo.regimenPatientInfo != undefined
          ) {
            let regimenPatientInfo = store.getState().regimenPatientInfo
              .regimenPatientInfo;
            if (
              regimenPatientInfo != null &&
              (regimenPatientInfo.state ==
                Constants.PATIENT_STATE_ACTIVE_SUSPEND ||
                regimenPatientInfo.state ==
                  Constants.PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE)
            ) {
              console.log('Fetching data from react native');
              const response = await PatientController.getRegimenPatient(
                regimenPatientInfo.patient_id,
                '',
              );
              console.log('After call getRegimenPatient');
              // const patientState = await StorageUtils.getData('patientState');
              if (response == null) {
                alert(
                  'Không tìm thấy thông tin, bận cần đăng kí phác đồ trước',
                );
                // Actions.activeRegimen({active: 'false'});
              } else {
                console.log('Before wait response.json()');
                var responseJson = await response.json();
                console.log('After wait response.json()');
                if (responseJson == null || responseJson.length == 0) {
                  alert('Không tìm thấy phác đồ, cần đăng kí phác đồ trước');
                } else {
                  var regimenPatient = responseJson[0];
                  //store regiment patient to redux for other screen
                  store.dispatch(actions.storeRegimenPatient(regimenPatient));

                  await StorageUtils.storeJsonData(
                    'regimenPatientInfo',
                    regimenPatient,
                  );

                  console.log(
                    'RegimenPatient receive:' + JSON.stringify(responseJson[0]),
                  );
                }
              }
            } else {
              console.log(
                'Detect change state from db server ' +
                  JSON.stringify(regimenPatientInfo.state),
              );
              //  RNNotificationService.stopService();
            }
          } else {
            console.log('Not found props regimenPatientInfo');
            // RNNotificationService.stopService();
          }
        }

        // Required: Signal completion of your task to native code
        // If you fail to do this, the OS can terminate your app
        // or assign battery-blame for consuming too much background-time
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
      },
      error => {
        console.log('[js] RNBackgroundFetch failed to start');
      },
    );

    // Optional: Query the authorization status.
    BackgroundFetch.status(status => {
      switch (status) {
        case BackgroundFetch.STATUS_RESTRICTED:
          console.log('BackgroundFetch restricted');
          break;
        case BackgroundFetch.STATUS_DENIED:
          console.log('BackgroundFetch denied');
          break;
        case BackgroundFetch.STATUS_AVAILABLE:
          console.log('BackgroundFetch is enabled');
          break;
      }
    });

    SplashScreen.hide();
  }

  onRegister(token) {
    Alert.alert('Registered !', JSON.stringify(token));
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  async onNotif(notif) {
    if (Platform.OS != 'android') {
      notif.finish(PushNotificationIOS.FetchResult.NoData);
    }
    //20200505 -  get regimen from userInfo
    let userInfo = undefined;
    if (
      store.getState().userInfo != null &&
      store.getState().userInfo != undefined &&
      store.getState().userInfo.userInfo != null &&
      store.getState().userInfo.userInfo != undefined
    ) {
      userInfo = store.getState().userInfo.userInfo;
    }
    if (userInfo == null || userInfo == undefined) {
      userInfo = await StorageUtils.getJsonData('userInfo');
      console.log(
        "Call StorageUtils.getJsonData('userInfo'):" + JSON.stringify(userInfo),
      );
    }
    if (userInfo == null || userInfo == undefined) {
      alert('Bạn cần đăng nhập để thực hiện chức năng này');
      return;
    }
    let patientId = userInfo.patient_id;

    if (notif.group == 'Regimen') {
      //for regimen key
      // var regimenId = notif.tag;
      var response = await PatientController.getRegimenPatient(patientId);
      if (response == null) {
        alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
        return;
      }

      //done check response
      var responseJson = await response.json();
      if (responseJson == null || responseJson.length == 0) {
        alert('Không tìm thấy phác đồ, cần đăng kí phác đồ trước');
      } else {
        var regimenPatient = responseJson[0];
        store.dispatch(actions.storeRegimenPatient(regimenPatient));
        await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
      }
      console.log(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> curent screen:' +
          Actions.currentScene +
          '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      );
      if (Actions.currentScene !== 'activeRegimen') {
        Actions.activeRegimen();
      }
    }

    if (
      notif.group == 'ConfirmFinishRegimen' ||
      notif.message == 'Xác nhận mẫu thử sau phác đồ'
    ) {
      //done come to confirm screen
      // var regimenId = notif.tag;
      var response = await PatientController.getRegimenPatient(patientId);
      // const patientState = await StorageUtils.getData('patientState');
      if (response == null) {
        alert('Không tìm thấy thông tin, bận cần đăng kí phác đồ trước');
        // Actions.activeRegimen({active: 'false'});
      } else {
        var responseJson = await response.json();
        if (responseJson == null || responseJson.length == 0) {
          alert('Không tìm thấy phác đồ, cần đăng kí phác đồ trước');
        } else {
          var regimenPatient = responseJson[0];
          console.log(
            'RegimenPatient receive:' + JSON.stringify(responseJson[0]),
          );
          store.dispatch(actions.storeRegimenPatient(regimenPatient));
          await StorageUtils.storeJsonData(
            'regimenPatientInfo',
            regimenPatient,
          );
          if (Actions.currentScene !== 'finishRegimen') {
            Actions.finishRegimen({
              regimentId: regimenPatient.regimen_id,
              regimenPatient: JSON.stringify(regimenPatient),
            });
          }
        }
      }
    }
    console.log('receive notif:' + JSON.stringify(notif));
  }

  handlePerm(perms) {
    Alert.alert('Permissions', JSON.stringify(perms));
  }

  render() {
    // RNNotificationService.startService();
    return (
      <Provider store={store}>
        <ImageBackground
          source={require('./src/global/asset/images/background.jpg')}
          style={{width: '100%', height: '100%'}}>
          <View style={styles.container}>
            {Platform.OS !== 'android' && (
              <StatusBar backgroundColor="#2C7770" barStyle="light-content" />
            )}
            <Routes />
            <InternetNotice />
          </View>
        </ImageBackground>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    shadowColor: null,
    shadowOffset: null,
    shadowOpacity: null,
    shadowRadius: null,
  },
});
