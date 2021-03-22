import React, {Component, useState, useEffect} from 'react';
import {Buttons, Colors, Typography, Spacing} from '../../global/styles/index';
import * as Constants from '../../global/constants';
import CountDown from 'react-native-countdown-component';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import {Card, Button, CheckBox, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {api_end_point, backend_auth_key} from '../../GlobalCfg';
import * as StorageUtils from '../../global/utils/StorageUtils';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as PatientController from '../../controller/PatientController';
import * as RegimenController from '../../controller/RegimenController';
import moment from 'moment';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

const maxDeltaWait = 60000;
const maxDeltaFirstConfirm = 2 * 60 * 60000;
const maxDeltaSecondConfirm = 15 * 60000;
const scheduleFirstNotice = 30 * 60000;
const scheduleSecondNotice = 5 * 60000;
const maxNumberConfirm = 3;

let summary = [];
let countConfirm = 0;
let countDown = 2 * 60 * 60;
let countDownRunning = true;
let intervalWaitConfirm = null;

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

class ConfirmFinishRegimen extends Component {
  constructor(props) {
    super(props);
    this.actionCloseOverlay = this.addonCloseOverlay.bind(this);
    this.actionComfirmOverlay = this.addonConfirmOverlay.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.runActionCountdown = this.runActionCountdown.bind(this);
    this.nextSumary = this.nextSumary.bind(this);
    this.backSumary = this.backSumary.bind(this);
    this.state = {
      isLoading: true,
      regimentId: this.props.regimenId,
      summaryId: 0,
      stateNotice: 0,
      validate: '',
      sosVisible: false,
      confirmVisible: false,
      modalVisible: false,
      confirmNumber: 0,
      answerValue: [],
    };
    this.props.fetchQualityOfTreatments();
  }

  addonCloseOverlay() {
    return;
  }

  addonConfirmOverlay() {
    return;
  }

  getTotalTimeString = value => {
    let hours = Math.floor(value / 60 / 60);
    value = value - hours * 60 * 60;
    let minutes = Math.floor(value / 60);
    value = value - minutes * 60;
    return hours + ' giờ ' + minutes + ' phút ' + value + ' giây';
  };

  showNotice = content => {
    this.setState({modalVisible: true, validate: content});
  };

  showConfirmNotice = () => {
    this.actionComfirmOverlay = this.confirmRegimen.bind(this);
    this.setState({confirmVisible: true});
  };

  scheduleForConfirm(time, regimenId, repeat_time) {
    NotifyUtils.cancelAll();
    NotifyUtils.sendScheduleRepeated(
      new Date(time),
      'Xin vui lòng xác nhận mức độ sạch',
      'Xin vui lòng xác nhận mức độ sạch',
      'Xác nhận',
      'Đánh giá tình trạng đi ngoài',
      'ConfirmFinishRegimen',
      regimenId + '',
      'time',
      repeat_time,
    );
  }

  handleBackButtonClick() {
    Actions.home();
    return true;
  }

  sosAction = async () => {
    let regimenPatient = store.getState().regimenPatientInfo.regimenPatientInfo;
    if (regimenPatient == null || regimenPatient === undefined) {
      this.setState({
        sosVisible: false,
      });
      return;
    }
    regimenPatient.state = Constants.PATIENT_STATE_CONFIRM_SUSPEND;
    //fix api only update state
    await PatientController.updateRegimenPatientFields(
      regimenPatient.patient_regimen_id,
      [
        {
          key: 'state',
          value: regimenPatient.state,
        },
      ],
    );
    NotifyUtils.cancelAll();
    Linking.openURL(
      Platform.OS === 'android' ? `tel:${19008904}` : `telprompt:${19008904}`,
    );
    this.setState(
      {
        sosVisible: false,
      },
      () => Actions.resultRegimen(),
    );
  };

  checkWaitConfirm = async () => {
    let regimenInfo = this.props.regimenPatientInfo;
    let jsonOtherData = PatientController.safeParseJSON(regimenInfo.other_data);
    //Update thoi gian cho chuyen thong bao
    jsonOtherData.confirmRegimen.waitConfirmTime = -1;
    countDown =
      (jsonOtherData.confirmRegimen.endConfirmTime - new Date().getTime()) /
      1000;
    countDownRunning = true;
    regimenInfo.other_data = JSON.stringify(jsonOtherData);
    // await PatientController.updateRegimenPatient(
    //   regimenInfo.patient_id,
    //   regimenInfo,
    // );
    let response = await PatientController.updateRegimenPatientFields_2(
      regimenInfo.patient_regimen_id,
      {
        other_data: regimenInfo.other_data,
      },
    );

    this.setState({stateNotice: 1}, () => clearTimeout(intervalWaitConfirm));
  };

  runActionCountdown() {
    this.setState({
      sosVisible: false,
      confirmVisible: false,
      modalVisible: false,
      stateNotice: 2,
    });
  }

  rollbackRegimen = async () => {
    try {
      var regimenPatient = JSON.parse(this.props.regimenPatientInfo);
      regimenPatient.current_step = 0;
      regimenPatient.start_time = new Date();
      regimenPatient.state = Constants.PATIENT_STATE_READY_ACTIVE;
      // var response = await PatientController.updateRegimenPatient(
      //   regimenPatient.patient_id,
      //   regimenPatient,
      // );
      let response = await PatientController.updateRegimenPatientFields_2(
        regimenPatient.patient_regimen_id,
        {
          current_step: regimenPatient.current_step,
          start_time: regimenPatient.start_time,
          state: regimenPatient.state,
        },
      );

      var jsonResponse = await response.json();
      // console.log(
      //   'Update regimenPatient response ' + JSON.stringify(jsonResponse),
      // );
      await StorageUtils.removeData('RegimenConfirmTime');
      NotifyUtils.cancelAll();
      Actions.activeRegimen({
        active: 'false',
        regimentId: regimenPatient.regimen_id,
        regimenPatient: JSON.stringify(regimenPatient),
      });
    } catch (error) {
      //alert(error);
    }
  };

  confirmRegimen = async () => {
    let answers = this.state.answerValue;
    let answer = answers[this.state.confirmNumber];
    let images = this.props.qualityTreatmentInfo;
    if (answer === undefined || answer == null) {
      this.showNotice('Xin vui lòng xác nhận hình ảnh trên màn hình.');
      return;
    }
    for (let index = 0; index < images.length; index++) {
      const element = images[index];
      if (answer === index) {
        if (element.isOk) {
          await this.successConfirm();
        } else {
          await this.failConfirm();
        }
        return;
      }
    }
  };

  successConfirm = async () => {
    let regimenPatient = this.props.regimenPatientInfo;
    let jsonOtherData = JSON.parse(regimenPatient.other_data);
    countConfirm += 1;
    this.state.confirmNumber = countConfirm;
    jsonOtherData.confirmRegimen = {
      endConfirmTime: new Date().getTime(),
      confirmNumber: countConfirm,
      answerValue: this.state.answerValue,
    };
    regimenPatient.state = Constants.PATIENT_STATE_AFTER_CONFIRM;
    regimenPatient.other_data = JSON.stringify(jsonOtherData);
    // let response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );
    let response = await PatientController.updateRegimenPatientFields_2(
      regimenPatient.patient_regimen_id,
      {
        state: regimenPatient.state,
        other_data: regimenPatient.other_data,
      },
    );

    //done check response
    if (response == null) {
      alert('Vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }
    let jsonResponse = await response.json();
    if (
      jsonResponse != null &&
      jsonResponse !== undefined &&
      jsonResponse.affectedRows > 0
    ) {
      //sync to redux
      store.dispatch(actions.storeRegimenPatient(regimenPatient));
      //save to storage if query success
      await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
      NotifyUtils.cancelAll();
      Actions.confirmFinalRegimen();
    } else {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }
  };

  failConfirm = async () => {
    let regimenPatient = this.props.regimenPatientInfo;
    let jsonOtherData = JSON.parse(regimenPatient.other_data);
    let endConfirmTime = jsonOtherData.confirmRegimen.endConfirmTime;
    countConfirm += 1;
    this.state.confirmNumber = countConfirm;
    jsonOtherData.confirmRegimen.confirmNumber = countConfirm;
    //Nếu vượt quá số lần confirm ko chuẩn thì dừng và kết thúc quá trình uống thuốc
    if (countConfirm >= maxNumberConfirm) {
      regimenPatient.state = Constants.PATIENT_STATE_CONFIRM_NOT_CLEAN;
      // await PatientController.updateRegimenPatient(
      //   regimenPatient.patient_id,
      //   regimenPatient,
      // );
      await PatientController.updateRegimenPatientFields_2(
        regimenPatient.patient_regimen_id,
        {
          state: regimenPatient.state,
          other_data: JSON.stringify(jsonOtherData),
        },
      );
      countConfirm = 0;
      countDownRunning = false;
      NotifyUtils.cancelAll();
      Actions.resultRegimen();
      return;
    }
    //Nếu lần đầu confirm ko chuẩn thì dợi tiếp 15 phút để hỏi lại
    if (countConfirm === 1) {
      endConfirmTime = new Date().getTime() + maxDeltaSecondConfirm;
      jsonOtherData.confirmRegimen.endConfirmTime = endConfirmTime;
    }
    jsonOtherData.confirmRegimen.answerValue = this.state.answerValue;
    jsonOtherData.confirmRegimen.confirmNumber = countConfirm;
    regimenPatient.other_data = JSON.stringify(jsonOtherData);
    // let response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );
    let response = await PatientController.updateRegimenPatientFields_2(
      regimenPatient.patient_regimen_id,
      {
        other_data: regimenPatient.other_data,
      },
    );
    //done check response
    if (response == null) {
      this.showNotice(
        'Xin vui lòng đảm bảo kết nối internet cho thao tác này.',
      );
      return;
    }
    let jsonResponse = await response.json();
    if (
      jsonResponse != null &&
      jsonResponse !== undefined &&
      jsonResponse.affectedRows > 0
    ) {
      //sync to redux
      await store.dispatch(actions.storeRegimenPatient(regimenPatient));
      //save to storage if query success
      await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
      //Cập nhật thời gian countdown
      countDown = (endConfirmTime - new Date().getTime()) / 1000;
      if (countConfirm === 1) {
        this.actionCloseOverlay = this.overlayConfirmAction.bind(
          this,
          countConfirm,
        );
        this.scheduleForConfirm(
          endConfirmTime,
          this.state.regimenId,
          scheduleSecondNotice,
        );
        countDownRunning = true;
        this.setState({stateNotice: 1}, () =>
          this.showNotice(
            'Hiện tại bạn đi ngoài chưa sạch, xin vui lòng tiếp tục đi lại, xoa bụng và đi vệ sinh. Thông báo này sẽ được hiển thị lại sau 15 phút.',
          ),
        );
        return;
      } else {
        this.setState({stateNotice: 1}, () =>
          this.showNotice(
            'Hiện tại bạn đi ngoài chưa sạch, bạn còn ' +
              (maxNumberConfirm - countConfirm) +
              ' lượt để đánh giá. Xin vui lòng tiếp tục đi lại, xoa bụng và đi vệ sinh.',
          ),
        );
        return;
      }
    } else {
      this.showNotice(
        'Xin vui lòng đảm bảo kết nối internet cho thao tác này.',
      );
      return;
    }
  };

  overlayConfirmAction = number => {
    if (!countDownRunning) {
      countDownRunning = true;
    }
    if (number <= 1) {
      this.state.stateNotice = 1;
    } else {
      countConfirm = 0;
      Actions.resultRegimen();
    }
  };

  checkQuantity = () => {
    this.setState({stateNotice: 2, answer: []});
  };

  changeResult = number => {
    let answers = this.state.answerValue;
    // HaBM update
    answers[this.state.confirmNumber] = number;
    this.setState({
      answerValue: answers,
    });
  };

  flatListItemSeparator = () => {
    return <View style={styles.lineHorizonal} />;
  };

  buildContent() {
    switch (this.state.stateNotice) {
      case 0:
        return this.renderSumary();
      case 1:
        return this.renderWaiting();
      case 2:
        return this.renderConfirm();
      default:
        return <Text>Lỗi hệ thống</Text>;
    }
  }

  buildSummary = async () => {
    let totalTime = 0;
    let itemTime = [];
    let regimenInfo = await RegimenController.getRegimenInfo(
      this.state.regimenId,
    );
    //HaBM: sort by index
    let regimensteps = regimenInfo.regimensteps.sort((a, b) =>
      a.index > b.index ? 1 : -1,
    );
    let stepInfo = JSON.parse(this.props.regimenPatientInfo.step_timing);
    stepInfo.forEach((element, index) => {
      let countTime = Math.floor(
        moment
          .duration(moment(element.end_time).diff(moment(element.start_time)))
          .asSeconds(),
      );
      totalTime += countTime;
      itemTime[index] = Math.floor(countTime / 60);
    });

    let content = [];
    content[0] = (
      <View>
        <Text
          style={{
            fontSize: moderateScale(18),
            marginLeft: moderateScale(5),
            marginRight: moderateScale(5),
            marginVertical: moderateScale(5),
          }}>
          Bạn vừa hoàn thành việc uống thuốc làm sạch đại tràng. Thời gian uống
          thuốc của bạn như sau:
        </Text>
        <FlatList
          data={regimensteps}
          renderItem={({item, index}) => {
            return (
              <View
                style={{
                  fontSize: moderateScale(16),
                  paddingLeft: moderateScale(5),
                  backgroundColor: index % 2 !== 0 ? '#fff' : '#F2F2F2',
                }}>
                <Text style={{fontSize: moderateScale(16)}}>
                  {index + 1}.{item.name}
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(16),
                    marginRight: moderateScale(5),
                    alignSelf: 'flex-end',
                  }}>
                  {itemTime[index]} (phút)
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.overlayLineHorizonal} />
        <Text
          style={{
            fontSize: moderateScale(16),
            paddingLeft: moderateScale(5),
            fontWeight: 'bold',
          }}>
          Tổng thời gian thực hiện:
        </Text>
        <Text
          style={{
            fontSize: moderateScale(16),
            marginRight: moderateScale(5),
            fontWeight: 'bold',
            alignSelf: 'flex-end',
          }}>
          {this.getTotalTimeString(totalTime)}
        </Text>
      </View>
    );
    content[1] = (
      <View>
        <Text
          style={{
            fontSize: moderateScale(18),
            paddingLeft: moderateScale(5),
            paddingRight: moderateScale(5),
            textAlign: 'justify',
            marginVertical: moderateScale(5),
          }}>
          Trong 2 tiếng tiếp theo, bạn sẽ tiếp tục đi ngoài. Sau đó, bạn sẽ được
          hướng dẫn đánh giá tình trạng đi ngoài để xem mình đã đủ điều kiện soi
          hay chưa.
        </Text>
        <View style={styles.overlayLineHorizonal} />
        <Text
          style={{
            fontSize: moderateScale(18),
            paddingLeft: moderateScale(5),
            fontWeight: 'bold',
          }}>
          Trong thời gian này, bạn cần:
        </Text>
        <Text
          style={{fontSize: moderateScale(18), paddingLeft: moderateScale(5)}}>
          - Đi lại nhiều.{'\n'}- Xoa bụng thường xuyên.{'\n'}- Nếu có dấu hiệu
          bất thường cần báo ngay cho nhân viên y tế.
        </Text>
      </View>
    );
    return content;
  };

  backSumary = () => {
    let current = this.state.summaryId - 1;
    this.setState({
      summaryId: current,
    });
  };

  nextSumary = async () => {
    if (this.state.summaryId == summary.length - 1) {
      if (intervalWaitConfirm != null && intervalWaitConfirm != undefined) {
        clearTimeout(intervalWaitConfirm);
      }
      let regimenInfo = this.props.regimenPatientInfo;
      let jsonOtherData = PatientController.safeParseJSON(
        regimenInfo.other_data,
      );
      //Update thoi gian cho chuyen thong bao
      jsonOtherData.confirmRegimen.waitConfirmTime = -1;
      countDown =
        (jsonOtherData.confirmRegimen.endConfirmTime - new Date().getTime()) /
        1000;
      countDownRunning = true;
      regimenInfo.other_data = JSON.stringify(jsonOtherData);
      // await PatientController.updateRegimenPatient(
      //   regimenInfo.patient_id,
      //   regimenInfo,
      // );
      await PatientController.updateRegimenPatientFields_2(
        regimenInfo.patient_regimen_id,
        {
          other_data: regimenInfo.other_data,
        },
      );

      //Chuyen sang man hinh countdown
      this.setState({
        stateNotice: 1,
      });
    } else {
      let current = this.state.summaryId + 1;
      this.setState({
        summaryId: current,
      });
    }
  };

  renderSumary() {
    return (
      <View style={{flex: 1}}>
        <View style={styles.titleForm}>
          <Text style={styles.titleMainText}>HOÀN THÀNH</Text>
          <Text style={styles.titleSubText}>UỐNG THUỐC LÀM SẠCH ĐẠI TRÀNG</Text>
        </View>
        <View>{summary[this.state.summaryId]}</View>
        <View style={styles.formBtn}>
          <View style={styles.groupBtn}>
            <Button
              icon={
                <Icon
                  name="arrow-left"
                  color="#ffffff"
                  size={moderateScale(16)}
                  style={{marginRight: moderateScale(5)}}
                />
              }
              disabled={this.state.summaryId == 0}
              buttonStyle={styles.activeBtn}
              disabledStyle={styles.disableBtn}
              disabledTitleStyle={{color: '#fff'}}
              title="Quay lại"
              titleStyle={{fontSize: moderateScale(16)}}
              onPress={() => this.backSumary()}
            />
            <Button
              iconRight
              icon={
                <Icon
                  name="arrow-right"
                  color="#ffffff"
                  size={moderateScale(16)}
                  style={{marginLeft: 5}}
                />
              }
              buttonStyle={styles.activeBtn}
              title="Tiếp tục"
              titleStyle={{fontSize: moderateScale(16)}}
              onPress={() => this.nextSumary()}
            />
          </View>
        </View>
      </View>
    );
  }

  renderWaiting() {
    return (
      <View style={{flex: 1}}>
        <View style={styles.titleForm}>
          <Text style={styles.titleMainText}>CHUẨN BỊ</Text>
          <Text style={styles.titleSubText}>ĐÁNH GIÁ TÌNH TRẠNG ĐI NGOÀI</Text>
        </View>
        <Text
          style={{
            fontSize: moderateScale(18),
            paddingLeft: moderateScale(5),
            paddingRight: moderateScale(5),
            textAlign: 'justify',
            marginBottom: moderateScale(10),
          }}>
          Bạn còn :
        </Text>
        <CountDown
          size={moderateScale(30)}
          until={countDown}
          // onChange={time => {
          //   countDownBeforeUnmount = time;
          // }}
          running={countDownRunning}
          onFinish={this.runActionCountdown}
          digitStyle={{backgroundColor: '#F2CD5C'}}
          timeToShow={['H', 'M', 'S']}
          timeLabelStyle={{
            color: '#000',
            fontSize: moderateScale(18),
            fontWeight: 'bold',
          }}
          timeLabels={{h: 'Giờ', m: 'Phút', s: 'Giây'}}
          separatorStyle={{marginTop: moderateScale(-30)}}
          showSeparator
        />
        <Text
          style={{
            fontSize: moderateScale(18),
            paddingLeft: moderateScale(5),
            paddingRight: moderateScale(5),
            textAlign: 'justify',
            marginBottom: moderateScale(10),
          }}>
          cho tới thời điểm đánh giá tình trạng đi ngoài.
        </Text>
        <Text
          style={{
            fontSize: moderateScale(18),
            paddingLeft: moderateScale(5),
            fontWeight: 'bold',
          }}>
          Bạn cần tiếp tục:
        </Text>
        <Text
          style={{fontSize: moderateScale(18), paddingLeft: moderateScale(5)}}>
          - Đi lại nhiều. {'\n'}- Xoa bụng thường xuyên.{'\n'}- Nếu có dấu hiệu
          bất thường cần báo ngay cho nhân viên y tế.
        </Text>
        <View style={styles.formBtn}>
          <View style={styles.groupBtn}>
            <Button
              disabled={countConfirm == 0}
              buttonStyle={styles.activeBtn}
              disabledStyle={styles.disableBtn}
              disabledTitleStyle={{color: '#fff'}}
              title={'Đánh giá\ntình trạng đi ngoài'}
              titleStyle={{fontSize: moderateScale(16)}}
              onPress={() => {
                this.checkQuantity();
              }}
            />
            <Button
              buttonStyle={styles.stopBtn}
              title={'Dừng\ntoàn bộ quy trình'}
              titleStyle={{fontSize: moderateScale(16)}}
              onPress={() => {
                countDownRunning = false;
                this.setState({sosVisible: true});
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  renderConfirm() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        {/* <View style={styles.titleForm}>
          <Text style={styles.titleText}>
            Xin vui lòng lựa chọn hình ảnh màu nước phân ở lần cuối cùng đi
            ngoài.
          </Text>
        </View> */}
        <Card
          containerStyle={{borderRadius: 10}}
          titleStyle={{fontSize: 17}}
          title="Vui lòng lựa chọn hình ảnh màu nước phân ở lần cuối cùng đi ngoài">
          <View>
            {this.props == null ||
            this.props.qualityTreatmentInfo == null ||
            this.props.qualityTreatmentInfo.length == 0 ? (
              <View style={styles.item}>
                <Text style={styles.title}>Đang cập nhật thông tin</Text>
              </View>
            ) : (
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={this.props.qualityTreatmentInfo}
                ItemSeparatorComponent={this.flatListItemSeparator}
                numColumns={2}
                renderItem={({item, index}) => (
                  <View style={styles.flatForm}>
                    <TouchableOpacity onPress={() => this.changeResult(index)}>
                      <Text style={styles.titleImage}>Hình {index + 1}</Text>
                      <Image
                        source={{
                          uri: api_end_point + item.image.url,
                        }}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: moderateScale(75),
                        }}
                      />
                      <CheckBox
                        center
                        onPress={() => this.changeResult(index)}
                        checked={
                          this.state.answerValue[this.state.confirmNumber] ==
                          null
                            ? false
                            : this.state.answerValue[
                                this.state.confirmNumber
                              ] === index
                        }
                        size={moderateScale(18)}
                        checkedIcon="check"
                        uncheckedIcon="circle-o"
                        checkedColor="#cb3837"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            <Button
              icon={
                <Icon
                  name="check"
                  color="#fff"
                  size={moderateScale(16)}
                  style={{marginRight: moderateScale(5)}}
                />
              }
              titleStyle={styles.fontBtn}
              buttonStyle={styles.activeBtn}
              title="Xác nhận"
              onPress={() => this.showConfirmNotice()}
            />
          </View>
        </Card>
      </View>
    );
  }

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene === 'finishRegimen') {
    }
  }

  async componentDidMount() {
    //20200509 onBack android => back to home
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    let jsonOtherData = null;
    let regimenInfo = this.props.regimenPatientInfo;
    this.state.regimenId = regimenInfo.regimen_id;
    if (regimenInfo == null || regimenInfo === undefined) {
      this.setState(
        {
          isLoading: false,
        },
        () => this.showNotice('Lỗi hệ thống, vui lòng thử lại.'),
      );
      return;
    }
    let regimenOtherData = regimenInfo.other_data;
    if (
      regimenOtherData !== null &&
      regimenOtherData !== undefined &&
      regimenOtherData !== ''
    ) {
      jsonOtherData = PatientController.safeParseJSON(regimenOtherData);
    }
    //Reset flow
    if (jsonOtherData == null || Object.keys(jsonOtherData).length === 0) {
      console.log(
        'Not found otherData of regiment: create or reset confirm time !',
      );
      jsonOtherData = {
        ...jsonOtherData,
        confirmRegimen: {
          //Cho 1 phut de tu dong chuyen sang man hinh countdown
          waitConfirmTime: new Date().getTime() + maxDeltaWait,
          endConfirmTime: new Date().getTime() + maxDeltaFirstConfirm,
          confirmNumber: 0,
        },
      };
      //Update thoi gian cho chuyen thong bao
      regimenInfo.other_data = JSON.stringify(jsonOtherData);
      // PatientController.updateRegimenPatient(
      //   regimenInfo.patient_id,
      //   regimenInfo,
      // );
      PatientController.updateRegimenPatientFields_2(
        regimenInfo.patient_regimen_id,
        {
          other_data: regimenInfo.other_data,
        },
      );
    }
    let regimenConfirm = jsonOtherData.confirmRegimen;
    if (regimenConfirm == null || regimenConfirm === undefined) {
      console.log(
        'Not found confirmRegimen of regiment: create or reset confirm time !',
      );
      //Update thoi gian cho chuyen thong bao
      jsonOtherData = {
        ...jsonOtherData,
        confirmRegimen: {
          waitConfirmTime: new Date().getTime() + maxDeltaWait,
          endConfirmTime: new Date().getTime() + maxDeltaFirstConfirm,
          confirmNumber: 0,
        },
      };
      regimenConfirm = jsonOtherData.confirmRegimen;
      regimenInfo.other_data = JSON.stringify(jsonOtherData);
      // PatientController.updateRegimenPatient(
      //   regimenInfo.patient_id,
      //   regimenInfo,
      // );
      PatientController.updateRegimenPatientFields_2(
        regimenInfo.patient_regimen_id,
        {
          other_data: regimenInfo.other_data,
        },
      );
    }
    let confirmNumber = regimenConfirm.confirmNumber;
    let answerValue = regimenConfirm.answerValue;
    if (answerValue !== undefined) {
      this.state.answerValue = answerValue;
    }
    if (
      confirmNumber == null ||
      confirmNumber === undefined ||
      confirmNumber < 0
    ) {
      confirmNumber = 0;
      regimenConfirm.confirmNumber = 0;
    }
    //Man hinh thong bao ket thuc uong thuoc
    let endConfirmTime = regimenConfirm.endConfirmTime;
    if (
      endConfirmTime == null ||
      endConfirmTime === undefined ||
      endConfirmTime < 0
    ) {
      endConfirmTime = new Date().getTime() + maxDeltaFirstConfirm;
      jsonOtherData = {
        ...jsonOtherData,
        confirmRegimen: {
          waitConfirmTime: new Date().getTime() + maxDeltaWait,
          endConfirmTime: endConfirmTime,
          confirmNumber: 0,
        },
      };
      regimenConfirm = jsonOtherData.confirmRegimen;
      regimenInfo.other_data = JSON.stringify(jsonOtherData);
      store.dispatch(actions.storeRegimenPatient(regimenInfo));
      // PatientController.updateRegimenPatient(
      //   regimenInfo.patient_id,
      //   regimenInfo,
      // );
      PatientController.updateRegimenPatientFields_2(
        regimenInfo.patient_regimen_id,
        {
          other_data: regimenInfo.other_data,
        },
      );
    }
    if (confirmNumber === 0) {
      this.scheduleForConfirm(
        endConfirmTime,
        this.state.regimenId,
        scheduleFirstNotice,
      );
    } else {
      this.scheduleForConfirm(
        endConfirmTime,
        this.state.regimenId,
        scheduleSecondNotice,
      );
    }
    let waitConfirmTime = regimenConfirm.waitConfirmTime;
    if (
      waitConfirmTime == null ||
      waitConfirmTime === undefined ||
      waitConfirmTime >= new Date().getTime()
    ) {
      summary = await this.buildSummary();
      this.setState({
        isLoading: false,
        summaryId: 0,
        stateNotice: 0,
        confirmNumber: 0,
      });
      intervalWaitConfirm = setTimeout(() => {
        this.checkWaitConfirm();
      }, maxDeltaWait);
      return;
    }
    //Man hinh thong bao countdown
    countDown = (endConfirmTime - new Date().getTime()) / 1000;
    if (countDown <= 0) {
      countDownRunning = false;
      this.setState({
        stateNotice: 2,
        isLoading: false,
        confirmNumber: regimenConfirm.confirmNumber,
      });
    } else {
      countDownRunning = true;
      this.setState({
        stateNotice: 1,
        isLoading: false,
        confirmNumber: regimenConfirm.confirmNumber,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      sosVisible: false,
      confirmVisible: false,
      modalVisible: false,
    });
    countDownRunning = false;
    countDown = undefined;
    if (intervalWaitConfirm != null && intervalWaitConfirm !== undefined) {
      clearTimeout(intervalWaitConfirm);
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loadingForm}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Vui lòng đợi trong giây lát</Text>
        </View>
      );
    }
    let renderContent = this.buildContent();
    return (
      <View style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.modalVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Thông báo</Text>
            <Text style={styles.overlayContentText}>{this.state.validate}</Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => {
                  this.actionCloseOverlay();
                  this.setState({
                    modalVisible: false,
                  });
                }}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          isVisible={this.state.confirmVisible}
          height="auto"
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Xác nhận</Text>
            <Text style={styles.overlayContentText}>
              Bạn xác nhận đã lựa chọn hình ảnh chính xác với tình trạng hiện
              tại ?
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={{flexDirection: 'row', alignContent: 'space-around'}}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  this.setState({confirmVisible: false});
                }}>
                <Text style={styles.overlayTextNormal}>Hủy</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  this.actionComfirmOverlay();
                  this.setState({
                    confirmVisible: false,
                  });
                }}>
                <Text style={styles.overlayText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          isVisible={this.state.sosVisible}
          height="auto"
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Tạm dừng ?</Text>
            <Text style={styles.overlayContentText}>
              Bạn gặp phải triệu chứng bất thường ?{'\n'}Hãy liên hệ nhân viên y
              tế ngay để được tư vấn kịp thời !
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  countDownRunning = true;
                  this.setState({sosVisible: false});
                }}>
                <Text style={styles.overlayTextNormal}>Không</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={this.sosAction}>
                <Text style={styles.overlayText}>Gọi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <View style={{flex: 1}}>{renderContent}</View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  qualityTreatmentInfo: state.qualityTreatmentInfo.qualityTreatmentInfo,
  userInfo: state.userInfo,
  filterRegimen: state.filterRegimen,
  regimenInfo: state.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(ConfirmFinishRegimen);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  //title
  titleForm: {
    backgroundColor: '#F2CD5C',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: moderateScale(18),
    marginHorizontal: moderateScale(10),
  },
  titleMainText: {
    textAlign: 'center',
    fontSize: moderateScale(18),
    marginHorizontal: moderateScale(10),
  },
  titleSubText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginHorizontal: moderateScale(10),
  },
  //flat
  flatForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    // marginTop: -5,
  },
  titleImage: {
    textAlign: 'center',
    fontSize: moderateScale(17),
  },
  lineHorizonal: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    flex: 1,
    opacity: 0.2,
    marginBottom: moderateScale(10),
  },
  //loading
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    marginVertical: moderateScale(10),
    color: '#2C7770',
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
    padding: moderateScale(5),
  },
  overlayHeaderText: {
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    margin: moderateScale(5),
    fontWeight: 'bold',
  },
  overlayContentText: {
    fontWeight: '500',
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    margin: moderateScale(5),
  },
  overlayButtonOnlyOne: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: moderateScale(5),
    flex: 1,
  },
  overlayButton: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: moderateScale(5),
    flex: 0.5,
  },
  overlayTextNormal: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    fontWeight: 'normal',
  },
  overlayText: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
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
  //button
  fontBtn: {
    fontSize: moderateScale(16),
  },
  formBtn: {
    flex: 1,
    marginVertical: normalHeight(5),
    justifyContent: 'flex-end',
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  groupBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stopBtn: {
    backgroundColor: '#F25C5C',
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  activeBtn: {
    backgroundColor: '#03A678',
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  disableBtn: {
    backgroundColor: 'gray',
  },
});
