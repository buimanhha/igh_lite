import React, {Component, useState, useEffect} from 'react';
import {Buttons, Colors, Typography, Spacing} from '../../global/styles/index';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as Constants from '../../global/constants';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import * as PatientController from '../../controller/PatientController';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import {CheckBox, Card, Button, Overlay} from 'react-native-elements';
import Hr from 'react-native-hr-component';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  Platform,
  Dimensions,
  PixelRatio,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
import * as StorageUtils from '../../global/utils/StorageUtils';
import {ScrollView} from 'react-native-gesture-handler';
import overlayStyle from '../../global/asset/css/overlayStyle';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

const deviceW = Dimensions.get('window').width;
const deviceH = Dimensions.get('window').height;
const screenRate = deviceW / 430;
const myIcon = <Icon name="rocket" size={30} color="#900" />;
const myIconMedicalNote = (
  <Icon5 name="notes-medical" size={50 * screenRate} color="#900" solid />
);

//inline image
const InlineImage = props => {
  let style = props.style;
  if (style && Platform.OS === 'android') {
    // Multiply width and height by pixel ratio to fix React Native bug
    style = Object.assign({}, StyleSheet.flatten(props.style));
    ['width', 'height'].forEach(propName => {
      if (style[propName]) {
        style[propName] *= PixelRatio.get();
      }
    });
  }
  return <Image {...props} style={style} />;
};

// "Inherit" prop types from Image
InlineImage.propTypes = Image.propTypes;

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
    Alert.alert('L???i h??? th???ng', 'Xin vui l??ng kh???i ?????ng l???i ???ng d???ng !', [
      {
        text: 'Kh???i ?????ng l???i',
        onPress: () => {
          RNRestart.Restart();
        },
      },
    ]);
  }
};

setJSExceptionHandler(errorHandler, true);

class PreActiveRegimen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalNotice: '',
      modalSecondContent: '',
      indexContent: 0,
      modalHeader: '',
      modalVisible: false,
      atClinic: true,
      date: new Date(),
      show: false,
      showTime: false,
      mode: 'time',
      noteTypeTime: '',
      showOverlayCommon: false,
      textOverlayCommon: 'N/A',
      textOverlayCommonHeader: 'X??c nh???n',
    };
    if (this.props.regimenPatientInfo != null) {
      // console.log(
      //   'Call fetchRegimen id: ' + this.props.regimenPatientInfo.regimen_id,
      // );
      this.props.fetchRegimen(this.props.regimenPatientInfo.regimen_id);
    }
  }

  activeRegimen = () => {
    let validateOK = this.validateDate(this.state.date);
    if (validateOK == false) {
      return;
    }
    let activeCode = this.props.regimenPatientInfo.active_code;
    if (
      activeCode == null ||
      activeCode == undefined ||
      activeCode == '' ||
      activeCode == '0'
    ) {
      Actions.alertRegimenNotActive();
      return;
    }
    if (this.props.regimenPatientInfo == null) {
      this.setState({
        showOverlayCommon: true,
        textOverlayCommonHeader: 'Th??ng b??o',
        textOverlayCommon:
          'Kh??ng t??m th???y ph??c ?????. Vui l??ng ki???m tra l???i k???t n???i m???ng ho???c li??n h??? v???i nh??n vi??n h??? tr??? !!!',
      });
      return;
    }
    this.accept();
  };

  toggleSwitch = value => {
    this.setState({atClinic: value, show: false});
  };

  showDatePicker = mode => {
    this.setState({
      show: true,
      mode: mode,
      noteTypeTime:
        mode == 'date'
          ? 'Vui l??ng l???a ch???n ng??y n???i soi d??? ki???n'
          : 'Vui l??ng l???a ch???n gi??? n???i soi d??? ki???n ',
    });
  };

  validateDate = selectedDate => {
    if (this.state.atClinic == true) {
      return true;
    }
    if (selectedDate.getHours() < 8 || selectedDate.getHours() > 16) {
      this.setState({
        showOverlayCommon: true,
        textOverlayCommonHeader: 'Th??ng b??o',
        textOverlayCommon:
          'Vui l??ng nh???p gi??? d??? soi trong gi??? h??nh ch??nh, t??? 8h00 ?????n 16h00. Xin c???m ??n.',
      });
      return false;
    }
    if (
      moment(selectedDate).format('DD/MM/YYYY') ==
      moment(new Date()).format('DD/MM/YYYY')
    ) {
      //Not allow todate
      if (
        this.state.atClinic == false &&
        (new Date().getHours() >= selectedDate.getHours() ||
          new Date().getHours() > 14)
      ) {
        this.setState({
          show: false,
          showOverlayCommon: true,
          textOverlayCommonHeader: 'Th??ng b??o',
          textOverlayCommon:
            'B???n kh??ng th??? ch???n gi??? n???i soi v??o h??m nay, ???? qu?? gi??? ????? chu???n b???, vui l??ng ch???n v??o ng??y kh??c!!!',
        });
        return false;
      } else {
        console.log(
          'new Date().getHours():' +
            new Date().getHours() +
            ' selectedDate.getHours():' +
            selectedDate.getHours(),
        );
      }
      // selectedDate.setHours(7, 0, 0, 0);
    }
  };

  setDate = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      if (selectedDate.getDay() == 0) {
        this.setState({
          show: false,
          date: selectedDate,
          showOverlayCommon: true,
          textOverlayCommonHeader: 'Th??ng b??o',
          textOverlayCommon:
            'Ch??? nh???t ph??ng kh??m kh??ng l??m vi???c, vui l??ng ch???n l???i t??? T2 t???i T7',
        });
      } else {
        if (Platform.OS !== 'android') {
          this.setState({date: selectedDate});
        } else {
          this.setState({show: false, date: selectedDate});
        }
        // console.log('call on chane selectedDate:' + selectedDate);
      }
      // console.log('this.state:' + JSON.stringify(this.state));
    }
  };

  closeModal = () => {
    this.setState({modalVisible: false});
  };

  showModal = indexContent => {
    this.setState({
      modalVisible: true,
      indexContent: indexContent,
    });
  };

  accept = () => {
    let atClinic = this.state.atClinic;
    var currentTime = new Date().getTime();
    let timeNotify = new Date();
    //done caculate time at home
    if (atClinic == false) {
      let atMorning = moment(this.state.date).get('hour') < 12;
      // console.log('moment.tz.gethour():' + moment(this.state.date).get('hour'));
      //init totalTime equal 2h before internal test
      let totalTime = 2 * 60;
      let regimenInfo = this.props.regimenInfo;
      if (
        regimenInfo !== undefined &&
        regimenInfo !== null &&
        regimenInfo.regimensteps !== undefined &&
        regimenInfo.regimensteps != null
      ) {
        regimenInfo.regimensteps.forEach((item, index) => {
          totalTime = totalTime + item.time;
        });
        // console.log(
        //   'Total time regimen:' + totalTime + ' morning:' + atMorning,
        // );
      } else {
        this.closeModal();
        // console.log('RegimenInfo is ' + JSON.stringify(regimenInfo));
        alert('Kh??ng t??m th???y th??ng tin ph??c ????? !!!');
        return;
      }

      if (atMorning == true) {
        //alert nh???c kh???i ?????ng l??? tr??nh v??o 19h t???i h??m tr?????c
        timeNotify = moment(this.state.date).toDate();
        timeNotify = moment(this.state.date)
          .add(-24, 'hours')
          .toDate();
        timeNotify.setHours(19, 0, 0, 0);
        // .set(19, 'hours')
        // .toDate();
        console.log('timeNotify morning:' + timeNotify.toString());
      } else {
        timeNotify = moment(this.state.date)
          .add(-totalTime, 'minutes')
          .toDate();
        // console.log('timeNotify afternoon:' + timeNotify.toString());
      }
      // console.log('timeNotify:' + timeNotify.toString());
    }
    //end
    this.setState(
      {
        isRun: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
        step: 0,
        subStep: 0,
        startTimeStep: this.state.date.getTime(),
        startTimeSubStep: currentTime,
        modalVisible: false,
      },
      async () => {
        var regimenPatient = this.props.regimenPatientInfo;
        regimenPatient.current_step = 0;
        //start_time ch???a th??ng tin th???i ??i???m b???t ?????u n???i soi
        regimenPatient.exp_date = this.state.date;
        regimenPatient.eff_date = timeNotify;
        regimenPatient.state = Constants.PATIENT_STATE_READY_ACTIVE;
        regimenPatient.regimen_where = atClinic == true ? 'clinic' : 'home';
        regimenPatient.step_timing = '[]';
        // var response = await PatientController.updateRegimenPatient(
        //   regimenPatient.patient_id,
        //   regimenPatient,
        // );
        var response = await PatientController.updateRegimenPatientFields_2(
          regimenPatient.patient_regimen_id,
          {
            current_step: regimenPatient.current_step,
            exp_date: regimenPatient.exp_date,
            eff_date: regimenPatient.eff_date,
            state: regimenPatient.state,
            regimen_where: regimenPatient.regimen_where,
            step_timing: regimenPatient.step_timing,
          },
        );
        if (response == null) {
          alert(
            'L???i!!! Xin vui l??ng ?????m b???o k???t n???i internet cho thao t??c n??y',
          );
          return;
        }
        var jsonResponse = await response.json();
        // console.log(
        //   'Update regimenPatient response ' + JSON.stringify(jsonResponse),
        // );
        //done check response
        if (
          jsonResponse != null &&
          jsonResponse != undefined &&
          jsonResponse.affectedRows > 0
        ) {
          //store regiment patient to redux for other screen
          // console.log('Update regimentPatient success');
          store.dispatch(actions.storeRegimenPatient(regimenPatient));
          //save to storage if query success
          await StorageUtils.storeJsonData(
            'regimenPatientInfo',
            regimenPatient,
          );
        } else {
          alert(
            'L???i!!! Xin vui l??ng ?????m b???o k???t n???i internet cho thao t??c n??y',
          );
          return;
        }
        //end
        //sent schedule
        if (atClinic != true) {
          //done only send schedule when at home
          NotifyUtils.cancelAll();
          NotifyUtils.sendScheduleAnswer(
            timeNotify.getTime() > new Date().getTime()
              ? timeNotify
              : new Date(),
            // new Date(new Date().getTime() + timeProgress),
            '???? t???i gi??? b???t ?????u th???c hi???n li???u tr??nh u???ng thu???c ????? ng??y mai th???c hi???n n???i soi?',
            'T???i gi??? b???t ?????u u???ng thu???c',
            'X??c nh???n',
            'X??c nh???n',
            'PreRegimen',
            0,
            'time',
            300000,
          );
        }
        Actions.DetailRegimen({regimenId: regimenPatient.regimen_id});
        // Actions.activeRegimen({sentSchedule: true});
      },
    );
  };

  //show date if click to date
  setShow = () => {
    this.setState({show: true, mode: 'date'});
  };

  //show time if click to time
  setShowTime = () => {
    this.setState({show: true, mode: 'time'});
  };

  render() {
    let atHome = !this.state.atClinic;
    return (
      <View style={styles.wrapper}>
        {/* overlay common for alert only */}
        <Overlay
          isVisible={this.state.showOverlayCommon}
          height="auto"
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          onBackdropPress={() => {
            this.setState({
              showOverlayCommon: false,
              textOverlayCommon: 'Whatsapp!!!',
            });
          }}
          style={overlayStyle.overlay}>
          <View style={overlayStyle.overlayContainer}>
            <Text style={overlayStyle.overlayHeaderText}>
              {this.state.textOverlayCommonHeader}
            </Text>
            <Text style={overlayStyle.overlayContentText}>
              {this.state.textOverlayCommon}
            </Text>
            <View style={overlayStyle.overlayLineHorizonal} />
            <View style={overlayStyle.overlayRowDirection}>
              <TouchableOpacity
                style={overlayStyle.overlayButtonOnlyOne}
                onPress={async () => {
                  this.setState({
                    showOverlayCommon: false,
                    textOverlayCommon: 'Whatsapp!!!',
                  });
                }}>
                <Text style={overlayStyle.overlayText}>?????ng ??</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          height="auto"
          width={deviceW * 0.95}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={overlayStyle.overlay}
          children={
            <ScrollView>
              <View style={overlayStyle.overlayContainer}>
                <View
                  style={{
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {/* <Icon5.Button
                    name="notes-medical"
                    size={30}
                    color="#900"
                    solid
                    backgroundColor="#ffffff"> */}
                  <Text style={overlayStyle.overlayHeaderText}>L??U ??</Text>
                  {/* </Icon5.Button> */}
                </View>
                {atHome && this.state.indexContent == 0 && (
                  <View>
                    <View
                      style={{
                        alignSelf: 'center',
                        alignItems: 'center',
                        justiftyContent: 'center',
                      }}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}>
                      <Text style={overlayStyle.overlayContentText}>
                        <Icon name="check" style={styles.iconInText} /> Trong
                        2-3 ng??y tr?????c ng??y n???i soi, kh??ng ??n c??c lo???i hoa qu???
                        c?? h???t nh?? d??a h???u, c?? chua, nho, d??a chu???t, thanh long
                        ho???c c??c lo???i h???t nh?? h???nh nh??n, l???c, h???t d???, ???
                      </Text>
                      <Image
                        source={require('../../global/asset/images/noticeHome1.png')}
                        style={{
                          width: 300 * screenRate,
                          height: 200 * screenRate,
                          resizeMode: 'contain',
                          marginBottom: 5,
                        }}
                      />
                    </View>
                    <View style={overlayStyle.overlayLineHorizonal} />
                    <View style={overlayStyle.overlayRowDirection}>
                      <TouchableOpacity
                        style={overlayStyle.overlayButton}
                        onPress={() => this.closeModal()}>
                        <Text style={overlayStyle.overlayTextNormal}>H???y</Text>
                      </TouchableOpacity>
                      <View style={overlayStyle.overlayLineVertical} />
                      <TouchableOpacity
                        style={overlayStyle.overlayButton}
                        onPress={() => {
                          if (atHome) {
                            this.setState({indexContent: 1});
                          }
                        }}>
                        <Text style={overlayStyle.overlayText}>Ti???p t???c</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {this.state.indexContent == 1 && (
                  <ScrollView>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}>
                      <Text style={overlayStyle.overlayContentText}>
                        <Icon name="check" style={styles.iconInText} /> V??o
                        tr?????c ng??y d??? soi, ng???ng u???ng c??c thu???c c?? ch???t s???t
                        {'\n'}
                        <Icon name="check" style={styles.iconInText} /> Kh??ng ??n
                        c??c th???c ph???m c???ng, kh?? ti??u.{'\n'}
                        <Icon name="check" style={styles.iconInText} /> N??n ??n
                        ch??? ????? kh??ng c?? ch???t x?? v?? rau. Bu???i t???i n??n ??n c??m n??t
                        ho???c ch??o (kh??ng ??n ch??o c??c lo???i h???t, c??c lo???i ?????, ch??o
                        c?? h??nh).{'\n'}
                        <Icon name="check" style={styles.iconInText} /> Tr??nh
                        c??c n?????c c?? m??u, kh??ng n?????c caf??, s???a, yogurt, r?????u hay
                        socola.
                      </Text>
                      <Image
                        source={require('../../global/asset/images/noticeHome2.png')}
                        style={{
                          width: 300 * screenRate,
                          height: 150 * screenRate,
                          resizeMode: 'contain',
                          marginBottom: 5,
                        }}
                      />
                    </View>
                    <View style={overlayStyle.overlayLineHorizonal} />
                    <View style={overlayStyle.overlayRowDirection}>
                      {/* <TouchableOpacity
                        style={overlayStyle.overlayButton}
                        onPress={() => this.closeModal()}>
                        <Text style={overlayStyle.overlayTextNormal}>H???y</Text>
                      </TouchableOpacity>
                      <View style={overlayStyle.overlayLineVertical} /> */}
                      <TouchableOpacity
                        style={overlayStyle.overlayButton}
                        onPress={() => {
                          atHome
                            ? this.setState({indexContent: 0})
                            : this.closeModal();
                        }}>
                        <Text style={overlayStyle.overlayTextNormal}>
                          {atHome ? 'Quay l???i' : 'T??? ch???i'}
                        </Text>
                      </TouchableOpacity>
                      <View style={overlayStyle.overlayLineVertical} />
                      <TouchableOpacity
                        style={overlayStyle.overlayButton}
                        onPress={() => this.accept()}>
                        <Text style={overlayStyle.overlayText}>?????ng ??</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </View>
            </ScrollView>
          }
          isVisible={this.state.modalVisible}
          onBackdropPress={() => this.closeModal()}
        />
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          <View style={styles.container}>
            {(Platform.OS === 'android' ||
              (Platform.OS !== 'android' && this.state.show == false)) && (
              <Card
                title="X??c nh???n ?????a ??i???m u???ng thu???c"
                titleStyle={{fontSize: 18}}
                containerStyle={{borderRadius: 10}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <TouchableOpacity
                    style={styles.contentCheckbox}
                    onPress={() => this.toggleSwitch(true)}>
                    <Image
                      style={styles.imageButton}
                      source={require('../../global/asset/images/hospital.png')}
                    />
                    <Text style={styles.titleCheckbox}>C?? s??? y t???</Text>
                    <CheckBox
                      checked={this.state.atClinic}
                      size={35}
                      containerStyle={{marginTop: -10}}
                      checkedIcon="check"
                      uncheckedIcon="circle-o"
                      checkedColor="#cb3837"
                      onPress={() => this.toggleSwitch(true)}
                    />
                  </TouchableOpacity>
                </View>
                <Button
                  onPress={this.activeRegimen}
                  buttonStyle={{backgroundColor: '#03A678'}}
                  icon={<Icon name="arrow-right" size={15} color="white" />}
                  title="Ti???p theo"
                  titleStyle={{marginHorizontal: 5}}
                />
              </Card>
            )}
            {this.state.show && Platform.OS !== 'android' && (
              <Text style={styles.titleChangeTime}>
                {this.state.noteTypeTime}
              </Text>
            )}
            {this.state.show && (
              <RNDateTimePicker
                testID="dateTimePicker"
                value={this.state.date}
                mode={this.state.mode}
                minimumDate={moment(new Date())
                  .add(0, 'days')
                  .toDate()}
                is24Hour={true}
                display="default"
                onChange={this.setDate}
              />
            )}
            {this.state.show && Platform.OS !== 'android' && (
              <Button
                onPress={() => {
                  this.setState({show: false});
                }}
                buttonStyle={{backgroundColor: '#03A678'}}
                title="Xong"
              />
            )}
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  regimenInfo: state.regimenInfo.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(PreActiveRegimen);

export const headerBasic = {
  fontSize: 24 * screenRate,
  color: '#2C7770',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10 * screenRate,
  fontWeight: 'bold',
};

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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  imageButton: {
    height: 95,
    width: 95,
    backgroundColor: 'white',
  },
  Time: {
    // flexGrow: 1,
    fontSize: 25 * screenRate,
    color: 'red',
    padding: 5 * screenRate,
    flex: 1,
    textAlign: 'center',
    backgroundColor: Colors.sectionBackground,
  },
  header1: {
    ...headerBasic,
  },
  timeLabel: {
    fontSize: 20 * screenRate,
    color: '#2C7770',
    alignContent: 'center',
    padding: 10 * screenRate,
    fontWeight: 'bold',
  },
  titlePage: {
    fontSize: 18,
    textAlign: 'justify',
    marginHorizontal: 10,
  },
  note: {
    ...headerBasic,
    fontWeight: 'normal',
  },
  rowCont: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: '40%',
    backgroundColor: '#2C7770',
    borderRadius: 25 * screenRate,
    paddingVertical: 12 * screenRate,
    marginLeft: '8%',
    marginRight: '8%',
    height: 50 * screenRate,
  },
  buttonDisable: {
    width: '40%',
    backgroundColor: Colors.darkGray,
    borderRadius: 25 * screenRate,
    paddingVertical: 12 * screenRate,
    marginLeft: '8%',
    marginRight: '8%',
    height: 50 * screenRate,
  },
  buttonText: {
    fontSize: 16 * screenRate,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'justify',
  },
  titleContainer: {
    textAlign: 'center',
    fontSize: 20 * screenRate,
    fontWeight: 'bold',
    color: '#2C7770',
    backgroundColor: 'white',
    marginVertical: 30 * screenRate,
  },
  titleCheckbox: {
    marginTop: -10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentCheckbox: {
    width: 150 * screenRate,
    alignItems: 'center',
  },
  titleText: {
    textAlign: 'center',
    color: '#2C7770',
    fontSize: 18 * screenRate,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  contentAlert: {
    marginVertical: 5 * screenRate,
    fontSize: 18 * screenRate,
    color: '#2C7770',
    textAlign: 'justify',
  },
  titleAlert: {
    fontWeight: 'bold',
    color: '#cb3837',
    fontSize: 20 * screenRate,
    textAlign: 'center',
    marginHorizontal: 5 * screenRate,
  },
  overlay: {
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: deviceW,
  },
  imageInline: {
    width: 20 * screenRate,
    height: 20 * screenRate,
  },
  iconInText: {
    fontSize: 18 * screenRate,
  },
  titleChangeTime: {
    fontSize: 24 * screenRate,
    fontWeight: '400',
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: 10 * screenRate,
  },
});
