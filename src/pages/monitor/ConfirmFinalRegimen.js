import React, {Component, useState, useEffect} from 'react';
import {Buttons, Colors, Typography, Spacing} from '../../global/styles/index';
import * as Constants from '../../global/constants';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Card, Input, Button, Overlay} from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import {Actions} from 'react-native-router-flux';
//redux
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import Hr from 'react-native-hr-component';
import * as RegimenController from '../../controller/RegimenController';
import * as PatientController from '../../controller/PatientController';
import * as StorageUtils from '../../global/utils/StorageUtils';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
//end
import moment from 'moment';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

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

class ConfirmFinalRegimen extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      contentOverlay: '',
      confirmVisible: false,
      showOverlay: false,
    };
  }

  //20200509 onBack android => back to home
  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    Actions.home();
    // this.props.navigation.popToTop();
    // this.props.navigation.goBack(null);
    return true;
  }

  closeModal = () => {
    this.setState({showOverlay: false});
  };

  setModalVisible = content => {
    this.setState({showOverlay: true, contentOverlay: content});
  };

  confirmFlyNumber = async value => {
    if (value == null || value === undefined || value < 0) {
      this.setModalVisible('Vui lòng nhập đầy đủ số lần bạn đi ngoài.');
      return;
    }
    let jsonOtherData = null;
    let regimenPatient = this.props.regimenPatientInfo;
    let regimenOtherData = regimenPatient.other_data;
    if (
      regimenOtherData !== null &&
      regimenOtherData !== undefined &&
      regimenOtherData !== ''
    ) {
      jsonOtherData = PatientController.safeParseJSON(regimenOtherData);
    }
    //Reset flow
    if (
      jsonOtherData == null ||
      jsonOtherData === undefined ||
      Object.keys(jsonOtherData).length === 0
    ) {
      jsonOtherData = {
        ...jsonOtherData,
        confirmRegimen: {
          defecation: value,
        },
      };
    } else {
      let regimenConfirm = jsonOtherData.confirmRegimen;
      if (regimenConfirm == null || regimenConfirm === undefined) {
        //Update thoi gian cho chuyen thong bao
        jsonOtherData = {
          ...jsonOtherData,
          confirmRegimen: {
            defecation: value,
          },
        };
      } else {
        regimenConfirm.defecation = value;
      }
    }
    regimenPatient.other_data = JSON.stringify(jsonOtherData);
    if (value >= 8) {
      regimenPatient.state = Constants.PATIENT_STATE_POST_SUPPORT;
      // this.props.dbUpdateRegimenPatient(this.props.regimenPatientInfo);
    } else {
      regimenPatient.state =
        Constants.PATIENT_STATE_POST_SUPPORT_NOT_ENOUGH_CONDITION;
      // this.props.dbUpdateRegimenPatient(this.props.regimenPatientInfo);
    }
    //update
    // let response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );
    let response = await PatientController.updateRegimenPatientFields_2(
      regimenPatient.patient_regimen_id,
      {
        // start_time:regimenPatient.start_time,
        // exp_date:regimenPatient.exp_date,
        // eff_date:regimenPatient.eff_date,
        state: regimenPatient.state,
        other_data: regimenPatient.other_data,
        // regimen_where:regimenPatient.regimen_where,
        // step_timing:regimenPatient.step_timing,
      },
    );
    if (response == null) {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }
    var jsonResponse = await response.json();
    //done check response
    if (
      jsonResponse != null &&
      jsonResponse !== undefined &&
      jsonResponse.affectedRows > 0
    ) {
      // console.log("Update regiment patient success");
      //sync to redux
      store.dispatch(actions.storeRegimenPatient(regimenPatient));
      //save to storage if query success
      await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
    }
    //end
    Actions.resultRegimen();
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.showOverlay}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Thông báo</Text>
            <Text style={styles.overlayContentText}>
              {this.state.contentOverlay}
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => {
                  this.setState({
                    showOverlay: false,
                  });
                }}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <View style={styles.container}>
          <Card
            title="Vui lòng xác nhận số lần đi ngoài."
            titleStyle={{fontSize: 18}}
            imageStyle={{height: hp('25%')}}
            image={require('../../global/asset/images/potty.jpg')}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 0.8}}>
                <Input
                  keyboardType="numeric"
                  returnKeyLabel="Done"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  // label="Số lần đi ngoài"
                  labelStyle={{color: '#2C7770'}}
                  placeholder="Nhập số lần đi ngoài"
                  onChangeText={value => {
                    this.setState({numberFly: value});
                  }}
                />
              </View>
              <View style={{flex: 0.2}}>
                <Button
                  icon={<Icon name="check" size={15} color="white" />}
                  containerStyle={{padding: 10}}
                  buttonStyle={{backgroundColor: '#2C7770'}}
                  // title="Xác nhận"
                  titleStyle={{marginHorizontal: 5}}
                  onPress={() => {
                    this.confirmFlyNumber(this.state.numberFly);
                  }}
                />
              </View>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => ({
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(ConfirmFinalRegimen);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
  },
  contentAlert: {
    marginVertical: 20,
    fontSize: 18,
    color: '#2C7770',
    textAlign: 'center',
  },
  titleAlert: {
    fontWeight: 'bold',
    color: '#cb3837',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 0,
    marginHorizontal: 10,
  },
  //style for overlay
  overlay: {
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: deviceW,
  },
  overlayContainer: {
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 10,
  },
  overlayHeaderText: {
    // fontWeight: '500',
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 20,
    margin: 10,
    fontWeight: 'bold',
  },
  overlayContentText: {
    fontWeight: '500',
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 18,
    margin: 10,
  },
  overlayButtonOnlyOne: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: 5,
    flex: 1,
  },
  overlayButton: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: 5,
    flex: 0.5,
  },
  overlayTextNormal: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: 'normal',
  },
  overlayText: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 18,
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
