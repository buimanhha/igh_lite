/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import * as PatientController from './src/controller/PatientController';
//import RNNotificationService from './RNNotificationService';

import store from './src/redux/stores';
import * as Constants from './src/global/constants';
import * as actions from './src/redux/actions';

const MyHeadlessTask = async taskData => {
  if (
    store.getState().regimenPatientInfo != null &&
    store.getState().regimenPatientInfo.regimenPatientInfo != null
  ) {
    let regimenPatientInfo = store.getState().regimenPatientInfo
      .regimenPatientInfo;
    if (
      regimenPatientInfo != null &&
      regimenPatientInfo.state == Constants.PATIENT_STATE_ACTIVE_SUSPEND
    ) {
      console.log('Fetching data from react native');
      //HaBM
      const response = await PatientController.getRegimenPatient(regimenPatientInfo.patient_id);
      console.log('After call getRegimenPatient id');
      // const patientState = await StorageUtils.getData('patientState');
      if (response == null) {
        alert('Không tìm thấy thông tin, bận cần đăng kí phác đồ trước');
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
          // console.log(
          //   'RegimenPatient receive:' + JSON.stringify(responseJson[0]),
          // );
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
};

AppRegistry.registerComponent(appName, () => App);
//AppRegistry.registerHeadlessTask('NotificationEvent', () => MyHeadlessTask);
