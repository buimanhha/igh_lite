import React, {Component, useState, useEffect} from 'react';
import {Buttons, Colors, Typography, Spacing} from '../../global/styles/index';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as Constants from '../../global/constants';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import Swiper from 'react-native-swiper';
import Hr from 'react-native-hr-component';
import {CheckBox, Card, Button, ListItem, Overlay} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  ScrollView,
  Dimensions,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  BackHandler,
  AppState,
  Platform,
} from 'react-native';
import {api_end_point, backend_auth_key, api_websocket} from '../../GlobalCfg';
import * as RegimenController from '../../controller/RegimenController';
import * as PatientController from '../../controller/PatientController';
import * as StorageUtils from '../../global/utils/StorageUtils';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
// import ActionButton from 'react-native-action-button';
import SwipeablePanel from 'rn-swipeable-panel';
//timeline
// import Timeline from 'react-native-timeline-flatlist';
//import moment from 'moment';
import moment from 'moment-timezone';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import io from 'socket.io-client';

const noticeDelay = 0;
const delayTimeFinishStep = 5 * 60 * 1000;
const deviceW = Dimensions.get('window').width;
const deviceH = Dimensions.get('window').height;
const screenRate = deviceW / 430;
const itemH = deviceH * 0.2;
// moment.tz.setDefault('Asia/Ho_Chi_Minh');

const defaultImage = '/src/global/asset/images/lighthouse.jpg';

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

class ActiveRegimen extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.advanceFunctionForOverlay1 = this.commonFunc.bind(this);
    this.advanceFunctionForOverlay2 = this.commonFunc.bind(this);
    var currentTime = new Date().getTime();
    this.state = {
      regimen_state: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      step: 0,
      startTimeStep: currentTime,
      needWaitMorning: false,
      stepImage: '/src/global/asset/images/lighthouse.jpg',
      regimen: {
        regimensteps: [{}],
      },
      isLoading: true,
      confirmVisible: false,
      bottomPanelVisible: false,
      data: [],
      endStepTime: false,
      overStepTime: false,
      isVisibleAlertOverTimeLevel1: false,
      isVisibleAlertOverTimeLevel2_1: false,
      isVisibleAlertOverTimeLevel2_2: false,
      showOverlay: false,
      // showOverlayFinishAll: false,
      showOverlayFinishStep: false,
      // showOverlayConfirmContinueRegimen: false,
      showOverlayCommon: false,
      textOverlayCommon: 'N/A',
      textOverlayCommonHeader: 'Xác nhận',

      textOverlayAdvanceCommonHeader: 'Xác nhận',
      textOverlayAdvanceCommon: 'N/A',
      showOverlayAdvanceCommon: false,
      textOverlayAdvance1Common: 'N/A',
      textOverlayAdvance2Common: 'N/A',
      //sent alert when forergound
      lastSentTime: 0,
      //end
    };
    //console.log('After call constructor:' + JSON.stringify(this.state));
    this.data = [];
    // this.loadRegimenData();
    this.registerWebSocket();
  }

  registerWebSocket = () => {
    try {
      let regimenPatientInfo = this.props.regimenPatientInfo.regimenPatientInfo;
      if (regimenPatientInfo == null || regimenPatientInfo == undefined) {
        if (__DEV__) {
          console.log('Not found regimen of patient !!');
        }
        return;
      }

      this.socket = io(api_websocket, {
        secure: true,
        transports: ['websocket'],
        path: '/websocket',
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: Infinity,
        jsonp: false,
      });
      this.socket.on('patient change state', async msg => {
        if (__DEV__) {
          console.log('Receive patient change state from backend');
        }
        //refresh -> to home -> to monitcor
        // Actions.refresh();
        await StorageUtils.storeData('routeToMonitor', 'true');
        Actions.root();
        NotifyUtils.cancelAll();
        //end
      });
      this.socket.on('connect', () => {
        if (__DEV__) {
          console.log('Connected socket success');
        }
        this.socket.emit('auth', regimenPatientInfo.patient_id);
      });
      this.socket.on('error', console.error);
      this.socket.on('connect_error', console.error);
    } catch (error) {
      if (__DEV__) {
        console.log('Exception socket|' + error);
      }
    }
  };

  commonFunc() {
    // console.log('Haha');
    return;
  }

  loadRegimenData = () => {
    //get regimen of user from state
    let regimenPatientData = store.getState().regimenPatientInfo;
    if (__DEV__) {
      console.log(
        'regimenPatientInfo from store :' + JSON.stringify(regimenPatientData),
      );
    }
    if (
      regimenPatientData == null ||
      regimenPatientData.regimenPatientInfo == null
    ) {
      if (__DEV__) {
        console.log('=====>> Not found regimenPatientInfo of user');
      }
      Actions.home();
      return;
    }
    let regimenPatientInfo = regimenPatientData.regimenPatientInfo;
    let regimenId = regimenPatientInfo.regimen_id;
    if (regimenId == null) {
      if (__DEV__) {
        console.log('=====>> Not found regimenId of user');
      }
      Actions.home();
      return;
    }
    this.state = {
      ...this.state,
      regimenPatient: regimenPatientInfo.regimenPatientInfo,
      runTimer: regimenPatientInfo.state == Constants.PATIENT_STATE_ACTIVE,
    };
    // console.log('call fetchRegimen');
    this.props.fetchRegimen(regimenId);
  };

  //begin
  refreshRegimenPatient = () => {
    let regimenInfo = this.props.regimenInfo.regimenInfo;
    let regimenPatientInfo = this.props.regimenPatientInfo.regimenPatientInfo;
    if (
      regimenInfo !== undefined &&
      regimenInfo !== null &&
      regimenInfo.regimensteps !== undefined &&
      regimenInfo.regimensteps != null
    ) {
      let stepImage = '';
      let timeLineData = [];
      let jsonStepTiming = [];
      let time = new Date();
      let stepTimingInfo = regimenPatientInfo.step_timing;
      if (
        stepTimingInfo != null &&
        stepTimingInfo != undefined &&
        stepTimingInfo != ''
      ) {
        try {
          jsonStepTiming = JSON.parse(stepTimingInfo);
        } catch (error) {
          //FIXME report error to database
          console.log('Error:' + error);
        }
      }
      //get start time --- loop ?
      // console.log('Start caculate time -> refreshRegimenPatient');
      regimenInfo.regimensteps.forEach((item, index) => {
        if (
          regimenPatientInfo.regimen_where == 'home' &&
          moment(regimenPatientInfo.exp_date).get('hour') < 12
        ) {
          if (
            item.regimen_step_when == 'morning' &&
            index >= 1 &&
            regimenInfo.regimensteps[index - 1].regimen_step_when != 'morning'
          ) {
            // done recalculate start_time
            let totalTime = 2 * 60;
            regimenInfo.regimensteps.forEach((item1, index1) => {
              if (index1 >= index) {
                totalTime = totalTime + item1.time;
                console.log('add time:' + item1.time);
              }
            });
            console.log(
              'exp_date time' +
                new Date(regimenPatientInfo.exp_date).toISOString(),
            );
            console.log('totalTime time' + totalTime);
            time = moment(regimenPatientInfo.exp_date).add(
              -totalTime,
              'minutes',
            );
            console.log('start time' + new Date(time).toISOString());
          } else {
            if (index >= 1) {
              time = moment(time).add(
                regimenInfo.regimensteps[index - 1].time,
                'minutes',
              );
            }
          }
        } else {
          if (index >= 1) {
            time = moment(time).add(
              regimenInfo.regimensteps[index - 1].time,
              'minutes',
            );
          }
        }

        if (regimenPatientInfo.current_step >= index) {
          if (
            jsonStepTiming[index] != null &&
            jsonStepTiming[index] != undefined
          ) {
            time = moment(new Date(jsonStepTiming[index].start_time));
          }
        }
        if (
          regimenPatientInfo.current_step == index &&
          item.image != null &&
          item.image != undefined &&
          item.image.url != null
        ) {
          stepImage = api_end_point + String(item.image.url);
        }

        //TODO fix duplicate code after

        let currentTime = new Date();

        let finishTime = moment(time).add(
          regimenInfo.regimensteps[index].time,
          'minutes',
        );

        //da thuc hien xong => co finish time
        if (
          regimenPatientInfo.current_step > index &&
          jsonStepTiming[index].end_time != undefined &&
          jsonStepTiming[index].end_time != null
        ) {
          finishTime = new Date(jsonStepTiming[index].end_time);
        }

        // console.log(
        //   'moment():' +
        //     moment()
        //       .toDate()
        //       .toString(),
        // );
        // console.log(
        //   'moment(finishTime):' +
        //     moment(finishTime)
        //       .toDate()
        //       .toString(),
        // );

        let diffDays = moment()
          .startOf('day')
          .diff(moment(finishTime).startOf('day'), 'day', true);
        let diffStart = moment()
          .startOf('day')
          .diff(moment(time).startOf('day'), 'day', true);
        let stringTime = moment(finishTime).format('H:mm');
        let stringStartTime = moment(time).format('H:mm');
        // console.log(
        //   'strtime:' +
        //     stringTime +
        //     ' diffEnd:' +
        //     diffDays +
        //     'abc:' +
        //     moment(time).format('D/M/YY H:mm'),
        // );
        // console.log(
        //   'strStartTime:' + stringStartTime + ' diffStart:' + diffStart,
        // );
        if (diffDays == 0) {
          stringTime = stringTime + ' hôm nay';
        } else if (diffDays == -1) {
          stringTime = stringTime + ' ngày mai';
        } else if (diffDays == 1) {
          stringTime = stringTime + ' hôm qua';
        } else {
          stringTime = moment(finishTime).format('D/M/YY H:mm');
        }

        if (diffStart == 0) {
          stringStartTime = stringStartTime + ' hôm nay';
        } else if (diffStart == -1) {
          stringStartTime = stringStartTime + ' ngày mai';
        } else if (diffStart == 1) {
          stringStartTime = stringStartTime + ' hôm qua';
        } else {
          stringTime = moment(time).format('D/M/YY H:mm');
        }

        let running = regimenPatientInfo.current_step == index;
        if (running == true) {
          let diffMinute = moment().diff(
            moment(new Date(finishTime)),
            'minutes',
          );

          stringTime =
            stringTime +
            (diffMinute > 0 ? ' (trễ ' : ' (còn ') +
            Math.abs(diffMinute) +
            ' phút)';
        }

        timeLineData[index] = {
          time: stringTime,
          startTime: stringStartTime,
          title: item.name,
          description: item.note,
          circleColor: '#009688',
          lineColor: '#009688',
          running: running,
          done: regimenPatientInfo.current_step > index,
          isNext: regimenPatientInfo.current_step < index,
        };
      });
      // console.log(' regimenPatientInfo.start_time = ' + regimenPatientInfo.start_time);
      this.setState(
        {
          isLoading: this.props.regimenInfo.loading,
          data: timeLineData,
          patientId: regimenPatientInfo.patient_id,
          regimen: this.props.regimenInfo.regimenInfo,
          step: regimenPatientInfo.current_step,
          startTimeStep:
            regimenPatientInfo.start_time == undefined
              ? new Date().getTime()
              : moment.tz(regimenPatientInfo.start_time, 'yyyy-MM-DD HH:mm:ss'),
          // startTimeStep: new Date(regimenPatientInfo.start_time).getTime(),
          stepImage: stepImage,
        },
        () => {
          console.log(
            'regimenPatientInfo.start_time:' +
              regimenPatientInfo.start_time +
              ' convert time xxx:' +
              new Date(this.state.startTimeStep),
          );
        },
      );
    }
  };

  rescheduleNotify = (deltaTime, repeatTime) => {
    NotifyUtils.cancelAll();
    NotifyUtils.sendScheduleAnswer(
      new Date(new Date().getTime() + deltaTime),
      'Bạn đã hoàn thành ' +
        this.state.regimen.regimensteps[this.state.step].name +
        ' chưa?',
      'Bạn đã hoàn thành ' +
        this.state.regimen.regimensteps[this.state.step].name +
        ' chưa?',
      'Xác nhận',
      'Bắt đầu uống thuốc',
      'Regimen',
      this.state.patientId,
      'time',
      repeatTime,
    );
  };

  componentDidCatch(error, errorInfo) {
    try {
      console.log('Error:' + error + ' errorInfo:' + JSON.stringify(errorInfo));
      // logErrorToMyService(error, errorInfo);
    } catch (error) {
      console.log('Error:' + error);
      //FIXME report error to database
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (Actions.currentScene === 'activeRegimen') {
      if (
        this.props.regimenInfo.loading === false &&
        prevProps.regimenInfo.loading === true
      ) {
        //loading regimen success
        let regimenInfo = this.props.regimenInfo.regimenInfo;
        if (regimenInfo == null && regimenInfo == undefined) {
          if (__DEV__) {
            console.log('Not found regiment info !!');
          }
          return;
        }
        if (__DEV__) {
          console.log('prevState:' + JSON.stringify(prevState));
        }
        //sync to storage
        await StorageUtils.storeJsonData('regimenInfo', regimenInfo);
        //end
        let regimenPatientInfo = this.props.regimenPatientInfo
          .regimenPatientInfo;
        if (
          regimenInfo !== undefined &&
          regimenInfo !== null &&
          regimenInfo.regimensteps !== undefined &&
          regimenInfo.regimensteps != null
        ) {
          let stepImage = '';
          let timeLineData = [];
          let jsonStepTiming = [];
          let time = new Date();
          let finishTime = new Date();
          let stepTimingInfo = regimenPatientInfo.step_timing;
          if (
            stepTimingInfo != null &&
            stepTimingInfo !== undefined &&
            stepTimingInfo !== ''
          ) {
            try {
              jsonStepTiming = JSON.parse(stepTimingInfo);
            } catch (error) {
              if (__DEV__) {
                console.log('Error:' + error);
              }
              reporter(error);
            }
          }
          //get start time
          if (__DEV__) {
            console.log('componentDidUpdate|Start caculate time');
          }
          regimenInfo.regimensteps.forEach((item, index) => {
            //if exp_date - gio hen - la buoi sang
            if (
              regimenPatientInfo.regimen_where === 'home' &&
              moment(regimenPatientInfo.exp_date).get('hour') < 12
            ) {
              if (
                item.regimen_step_when === 'morning' &&
                index >= 1 &&
                regimenInfo.regimensteps[index - 1].regimen_step_when !=
                  'morning'
              ) {
                // done recalculate start_time
                let totalTime = 2 * 60;
                regimenInfo.regimensteps.forEach((item1, index1) => {
                  if (index1 >= index) {
                    totalTime = totalTime + item1.time;
                    console.log('add time:' + item1.time);
                  }
                });
                console.log(
                  'exp_date time' +
                    new Date(regimenPatientInfo.exp_date).toISOString(),
                );
                console.log('totalTime time' + totalTime);
                time = moment(regimenPatientInfo.exp_date).add(
                  -totalTime,
                  'minutes',
                );
                console.log('start time' + new Date(time).toISOString());
              } else {
                if (index >= 1) {
                  time = moment(time).add(
                    regimenInfo.regimensteps[index - 1].time,
                    'minutes',
                  );
                }
              }
            } else {
              ////if exp_date - gio hen - la buoi chieu
              if (index >= 1) {
                time = moment(time).add(
                  regimenInfo.regimensteps[index - 1].time,
                  'minutes',
                );
              }
            }

            if (regimenPatientInfo.current_step >= index) {
              if (
                jsonStepTiming[index] != null &&
                jsonStepTiming[index] != undefined
              ) {
                time = moment(new Date(jsonStepTiming[index].start_time));
              }
            }
            if (
              regimenPatientInfo.current_step == index &&
              item.image != undefined &&
              item.image.url != null
            ) {
              stepImage = api_end_point + String(item.image.url);
            }

            let currentTime = new Date();

            let finishTime = moment(time).add(
              regimenInfo.regimensteps[index].time,
              'minutes',
            );

            //da thuc hien xong => co finish time
            if (
              regimenPatientInfo.current_step > index &&
              jsonStepTiming[index].end_time != undefined &&
              jsonStepTiming[index].end_time != null
            ) {
              finishTime = new Date(jsonStepTiming[index].end_time);
            }

            console.log(
              'moment(finishTime):' +
                moment(finishTime)
                  .toDate()
                  .toString(),
            );

            let diffDays = moment()
              .startOf('day')
              .diff(moment(finishTime).startOf('day'), 'day', true);
            let diffStart = moment()
              .startOf('day')
              .diff(moment(time).startOf('day'), 'day', true);
            let stringTime = moment(finishTime).format('H:mm');
            let stringStartTime = moment(time).format('H:mm');
            console.log(
              'strtime:' +
                stringTime +
                ' diffEnd:' +
                diffDays +
                'abc:' +
                moment(time).format('D/M/YY H:mm'),
            );
            console.log(
              'strStartTime:' + stringStartTime + ' diffStart:' + diffStart,
            );
            if (diffDays == 0) {
              stringTime = stringTime + ' hôm nay';
            } else if (diffDays == -1) {
              stringTime = stringTime + ' ngày mai';
            } else if (diffDays == 1) {
              stringTime = stringTime + ' hôm qua';
            } else {
              stringTime = moment(finishTime).format('D/M/YY H:mm');
            }

            if (diffStart == 0) {
              stringStartTime = stringStartTime + ' hôm nay';
            } else if (diffStart == -1) {
              stringStartTime = stringStartTime + ' ngày mai';
            } else if (diffStart == 1) {
              stringStartTime = stringStartTime + ' hôm qua';
            } else {
              stringTime = moment(time).format('D/M/YY H:mm');
            }

            let running = regimenPatientInfo.current_step == index;
            if (running == true) {
              let diffMinute = moment().diff(
                moment(new Date(finishTime)),
                'minutes',
              );

              stringTime =
                stringTime +
                (diffMinute > 0 ? ' (trễ ' : ' (còn ') +
                Math.abs(diffMinute) +
                ' phút)';
            }

            timeLineData[index] = {
              time: stringTime,
              startTime: stringStartTime,
              title: item.name,
              description: item.note,
              circleColor: '#009688',
              lineColor: '#009688',
              running: running,
              done: regimenPatientInfo.current_step > index,
              isNext: regimenPatientInfo.current_step < index,
            };
          });

          let regimen_state = regimenPatientInfo.state;
          console.log(
            'regimenPatientInfo.state:' +
              regimenPatientInfo.state +
              ' this.state.regimen_state:' +
              this.state.regimen_state,
          );
          if (regimenPatientInfo.state != this.state.regimen_state) {
            console.log(
              '***************:regimen patient change state from :' +
                this.state.regimen_state +
                ' to ' +
                regimenPatientInfo.state,
            );
            regimen_state = regimenPatientInfo.state;
            //fix duplicate alert
            this.setState(
              {
                isLoading: this.props.regimenInfo.loading,
                data: timeLineData,
                patientId: regimenPatientInfo.patient_id,
                regimen: regimenInfo,
                step: regimenPatientInfo.current_step,
                //[Fix] Kiem tra lai phia web da add time nhu the nao, hardcode + 7h
                startTimeStep:
                  regimenPatientInfo.start_time == undefined
                    ? new Date().getTime()
                    : moment.tz(
                        regimenPatientInfo.start_time,
                        'yyyy-MM-DD HH:mm:ss',
                      ),
                stepImage: stepImage,
                regimen_state: regimen_state,
                showOverlayFinishStep: false,
              },
              () => {
                console.log(
                  'regimenPatientInfo.start_time:' +
                    regimenPatientInfo.start_time +
                    ' convert time:' +
                    new Date(this.state.startTimeStep),
                );
                //if wait for time in the morning
                if (
                  regimenPatientInfo.state ==
                  Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING
                ) {
                  //notify to alert time to continues in morning
                  NotifyUtils.cancelAll();
                  NotifyUtils.sendScheduleAnswer(
                    new Date(this.state.startTimeStep),
                    'Đã tới giờ để bắt đầu ' +
                      regimenInfo.regimensteps[this.state.step].name +
                      '',
                    'Nhắc lịch',
                    'Xác nhận',
                    'Phác đồ',
                    'Regimen',
                    this.state.patientId,
                    'time',
                    300000,
                  );
                  this.stopTimer();
                  return;
                }
                //end
                var timeSecond =
                  this.state.regimen.regimensteps[this.state.step].time *
                  60 *
                  1000;
                var currentTime = new Date().getTime();
                var finishTime = this.state.startTimeStep + timeSecond;
                var timeProgress = finishTime - currentTime;
                // console.log(
                //   'Current = ' + moment(currentTime).format('D/M/YY H:mm'),
                // );
                // console.log(
                //   'Start = ' +
                //     moment(this.state.startTimeStep).format('D/M/YY H:mm'),
                // );
                // console.log(
                //   'Finish = ' + moment(finishTime).format('D/M/YY H:mm'),
                // );
                // console.log(
                //   'Check = ' + timeProgress + ' = ' + delayTimeFinishStep,
                // );
                if (
                  timeProgress < 0 &&
                  Math.abs(timeProgress) >= delayTimeFinishStep
                ) {
                  // fix duplicate show overlay
                  if (
                    // this.state.showOverlayFinishStep == false &&
                    this.state.showOverlay === false &&
                    this.state.showOverlayFinishStep === false &&
                    this.state.showOverlayCommon === false &&
                    this.state.showOverlayAdvanceCommon === false
                  ) {
                    this.setState({
                      endStepTime: true,
                      lastSentTime: new Date().getTime(),
                    });
                    // //ask after check enough time
                    // this.advanceFunctionForOverlay2 = this.confirmNextStepOK.bind(
                    //   this,
                    //   true,
                    // );
                    // //fix
                    // this.setState({
                    //   showOverlayAdvanceCommon: true,
                    //   textOverlayAdvanceCommon:
                    //     '1 Bạn xác nhận đã hoàn thành bước này ?\nLưu ý bạn sẽ không thể quay trở lại bước này nếu đã chuyển sang bước tiếp theo.',
                    //   textOverlayAdvance1Common: 'Từ chối',
                    //   textOverlayAdvance2Common: 'Đồng ý',
                    //   lastSentTime: new Date().getTime(),
                    // });
                  }
                  //Kiem tra lai cho nay
                  timeProgress = Math.max(timeProgress, 0);
                  if (timeProgress == 0) {
                    this.rescheduleNotify(timeProgress + 300000, 300000);
                  } else {
                    this.rescheduleNotify(timeProgress, 300000);
                  }
                } else {
                  //Kiem tra lai cho nay
                  //done reschedule notifications
                  timeProgress = Math.max(timeProgress, 0);
                  if (timeProgress == 0) {
                    this.rescheduleNotify(timeProgress + 300000, 300000);
                  } else {
                    this.rescheduleNotify(timeProgress, 300000);
                  }
                }
              },
            );

            if (
              regimen_state == Constants.PATIENT_STATE_ACTIVE_SUSPEND ||
              regimen_state ==
                Constants.PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE
            ) {
              this.stopTimer();
            } else if (regimen_state == Constants.PATIENT_STATE_ACTIVE) {
              this.startTimer();
            }
          }
        }
      }

      // if (
      //   this.props.regimenInfo !== undefined &&
      //   prevProps.regimenInfo !== undefined &&
      //   this.props.regimenInfo.regimenInfo != undefined &&
      //   prevProps.regimenInfo.loading != undefined &&
      //   prevProps.regimenInfo.loading == true &&
      //   this.props.regimenInfo.loading !== prevProps.regimenInfo.loading
      // ) {
      //   console.log('***prevState:' + JSON.stringify(prevState));
      //   console.log(
      //     '###Recive this.props.regimenInfo:' +
      //       JSON.stringify(this.props.regimenInfo) +
      //       ' prevProps.regimenInfo:' +
      //       JSON.stringify(prevProps.regimenInfo),
      //   );

      //   console.log(
      //     '###Recive this.props.regimenPatientInfo:' +
      //       JSON.stringify(this.props.regimenPatientInfo.regimenPatientInfo) +
      //       ' prevProps.regimenPatientInfo:' +
      //       JSON.stringify(prevProps.regimenPatientInfo.regimenPatientInfo),
      //   );
      // }
    }
  }

  componentWillUnmount() {
    // console.log('Call componentWillUnmount');
    this.stopTimer();
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    try {
      //disconnect ws
      let regimenPatientInfo = this.props.regimenPatientInfo.regimenPatientInfo;
      if (regimenPatientInfo == null || regimenPatientInfo == undefined) {
        return;
      }
      this.socket.emit('close', regimenPatientInfo.patient_id);
      this.socket.disconnect();
      this.socket.close();
    } catch (error) {
      if (__DEV__) {
        console.log(error);
      }
    }
  }

  handleBackButtonClick() {
    Actions.home();
    return true;
  }

  async startTimer() {
    console.log('Start timer with old:' + this.timer);
    if (this.timer > 0) {
      this.stopTimer();
    }
    let before_step = 0;
    this.timer = setInterval(() => {
      if (Actions.currentScene !== 'activeRegimen') {
        this.stopTimer();
      }
      // console.log('this.timer:' + JSON.stringify(this.timer));
      //calculate for display
      let timeSecond =
        this.state.regimen.regimensteps[this.state.step].time * 60 * 1000;
      let currentTime = new Date().getTime();
      let finishTime = this.state.startTimeStep + timeSecond;
      let timeProgress = finishTime - currentTime;
      let isMiss = timeProgress < 0;
      //alert when isMiss and sent alert over 1 minutes
      // console.log(
      //   'over = ' + this.state.overStepTime + 'end = ' + this.state.endStepTime,
      // );
      if (
        isMiss &&
        !this.state.endStepTime &&
        !this.state.overStepTime &&
        this.state.lastSentTime + 60000 < new Date().getTime()
      ) {
        this.setState({endStepTime: true, lastSentTime: new Date().getTime()});
      } else {
        if (!isMiss && this.state.endStepTime) {
          this.setState({endStepTime: false});
        }
      }
      // if (
      //   isMiss === true &&
      //   this.state.showOverlay == false &&
      //   this.state.showOverlayFinishStep == false &&
      //   this.state.showOverlayCommon == false &&
      //   this.state.showOverlayAdvanceCommon == false &&
      //   this.state.lastSentTime + 60000 < new Date().getTime()
      // ) {
      //   //ask after check enough time
      //   this.advanceFunctionForOverlay2 = this.confirmNextStepOK.bind(
      //     this,
      //     true,
      //   );
      //   this.setState({
      //     showOverlayAdvanceCommon: true,
      //     textOverlayAdvanceCommon:
      //       '2 Bạn xác nhận đã hoàn thành bước này ?\nLưu ý bạn sẽ không thể quay trở lại bước này nếu đã chuyển sang bước tiếp theo.',
      //     textOverlayAdvance1Common: 'Từ chối',
      //     textOverlayAdvance2Common: 'Đồng ý',
      //     lastSentTime: new Date().getTime(),
      //   });
      // }
      //end
      if (timeProgress < 0) {
        timeProgress = -timeProgress;
      }
      var day = 0;
      var hour = Math.floor(
        (timeProgress - day * (24 * 60 * 60000)) / (60 * 60000),
      );
      var minute = Math.floor(
        (timeProgress - day * (24 * 60 * 60000) - hour * (60 * 60000)) / 60000,
      );
      var second = Math.floor(
        (timeProgress -
          day * (24 * 60 * 60000) -
          hour * (60 * 60000) -
          minute * 60000) /
          1000,
      );
      // done set state for view 3
      var regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
      if (regimenPatient.state !== Constants.PATIENT_STATE_ACTIVE) {
        this.stopTimer();
        return;
      }
      if (before_step != regimenPatient.current_step) {
        //
        this.refreshRegimenPatient();
        before_step = regimenPatient.current_step;
      } else if (minute != this.state.minute) {
        this.refreshRegimenPatient();
      } else {
      }
      this.setState({
        day: day,
        hour: hour > 9 ? hour : '0' + hour,
        minute: minute > 9 ? minute : '0' + minute,
        second: second > 9 ? second : '0' + second,
        running: 1,
        isMiss: isMiss,
      });
    }, 1000);
  }

  stopTimer = async () => {
    // console.log('Stop run timer ' + this.timer);
    clearInterval(this.timer);
    this.setState({step: this.state.step, running: 0});
  };

  confirmNextStepOK = validate => {
    let regimenInfo = this.props.regimenInfo.regimenInfo;
    let regimenPatientInfo = this.props.regimenPatientInfo.regimenPatientInfo;
    //done check min time process to allow nextStep???
    let currentStep = regimenInfo.regimensteps[this.state.step];
    if (
      this.state.step <
      this.props.regimenInfo.regimenInfo.regimensteps.length - 1
    ) {
      // let alertLevel1 = false;
      // let alertLevel2 = false;
      // let processTime =
      //   (new Date().getTime() - this.state.startTimeStep) / 60000;
      //fix allow over 5 minute
      // if (
      //   processTime > currentStep.time + 5 &&
      //   processTime < currentStep.max_time
      // ) {
      //   alertLevel1 = true;
      //   alertLevel2 = false;
      // } else if (processTime > currentStep.max_time) {
      //   alertLevel2 = true;
      //   alertLevel1 = false;
      //   if (
      //     alertLevel2 == true &&
      //     (validate == undefined || validate == true)
      //   ) {
      //     this.setState({
      //       isVisibleAlertOverTimeLevel1: alertLevel1,
      //       isVisibleAlertOverTimeLevel2_1: alertLevel2,
      //       isVisibleAlertOverTimeLevel2_2: false,
      //     });
      //     return;
      //   } else {
      //     //neu khong validate
      //     alertLevel2 = false;
      //   }
      // }
      let item = regimenInfo.regimensteps[this.state.step + 1];
      let index = this.state.step + 1;
      let needWaitMorning = false;
      let startTimeMorning = new Date();
      //done check if new step is morning and previous step is everning => change state to WAIT_FOR_TIME_MORNING, set start_time to new time in morning
      if (
        regimenPatientInfo.regimen_where === 'home' &&
        moment(regimenPatientInfo.exp_date).get('hour') < 12 &&
        item.regimen_step_when === 'morning' &&
        regimenInfo.regimensteps[this.state.step].regimen_step_when !==
          'morning'
      ) {
        // done recalculate start_time
        // console.log('Need to set to waiting for morning time');
        let totalTime = 2 * 60;
        regimenInfo.regimensteps.forEach((item1, index1) => {
          if (index1 >= index) {
            totalTime = totalTime + item1.time;
            console.log('add time:' + item1.time);
          }
        });
        needWaitMorning = true;
        startTimeMorning = moment(regimenPatientInfo.exp_date)
          .add(-totalTime, 'minutes')
          .toDate();
      }
      //end
      var stepImage = this.props.regimenInfo.regimenInfo.regimensteps[
        this.state.step + 1
      ].image;
      if (stepImage != null && stepImage != undefined && stepImage != '') {
        this.setState({stepImage: api_end_point + stepImage.url});
      } else {
        this.setState({stepImage: defaultImage});
      }
      //done go to screen result alert over time process
      this.setState(
        {
          step: this.state.step + 1,
          startTimeStep: startTimeMorning.getTime(),
          needWaitMorning: needWaitMorning,
          // isVisibleAlertOverTimeLevel1: alertLevel1,
          // isVisibleAlertOverTimeLevel2_1: alertLevel2,
          // isVisibleAlertOverTimeLevel2_2: false,
        },
        async () => {
          console.log(
            'regimenPatientInfo.start_time:' +
              regimenPatientInfo.start_time +
              ' convert time:' +
              new Date(this.state.startTimeStep),
          );
          // var regimenPatient = this.state.regimenPatient;
          var regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
          if (
            needWaitMorning &&
            new Date().getTime() < this.state.startTimeStep
          ) {
            // console.log(
            //   'Change state to PATIENT_STATE_WAIT_FOR_TIME_MORNING for tomorow morning',
            // );
            regimenPatient.state =
              Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING;
          } else {
            regimenPatient.state = Constants.PATIENT_STATE_ACTIVE;
            // console.log('Change state normal');
          }
          regimenPatient.current_step = this.state.step;
          regimenPatient.start_time = new Date(this.state.startTimeStep);
          //done update time of this step
          let step_timing = regimenPatient.step_timing;
          let jsonStepTiming = [];
          if (
            step_timing != null &&
            step_timing != undefined &&
            step_timing != ''
          ) {
            try {
              jsonStepTiming = JSON.parse(step_timing);
            } catch (error) {
              //FIXME report error to database
              console.log('Error:' + error);
            }
          }
          jsonStepTiming[this.state.step - 1] = {
            ...jsonStepTiming[this.state.step - 1],
            end_time: new Date(regimenPatient.start_time).getTime(),
          };
          jsonStepTiming[this.state.step] = {
            start_time: new Date(regimenPatient.start_time).getTime(),
          };
          regimenPatient.step_timing = JSON.stringify(jsonStepTiming);
          var response = await PatientController.updateRegimenPatientFields(
            regimenPatient.patient_regimen_id,
            [
              {
                key: 'state',
                value: regimenPatient.state,
              },
              {
                key: 'current_step',
                value: regimenPatient.current_step,
              },
              {
                key: 'start_time',
                value: regimenPatient.start_time,
              },
              {
                key: 'step_timing',
                value: regimenPatient.step_timing,
              },
            ],
          );
          if (response == null) {
            alert(
              'Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này',
            );
            return;
          }
          var jsonResponse = await response.json();
          console.log(
            'Update regimenPatient response ' + JSON.stringify(jsonResponse),
          );
          if (
            jsonResponse != null &&
            jsonResponse !== undefined &&
            jsonResponse.affectedRows > 0
          ) {
            //sync to redux
            store.dispatch(actions.storeRegimenPatient(regimenPatient));
            //save to storage if query success
            await StorageUtils.storeJsonData(
              'regimenPatientInfo',
              regimenPatient,
            );
          } else {
            alert(
              'Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này',
            );
            return;
          }
          // refresh screen and regimenPatient
          this.refreshRegimenPatient();
          //end
          //send notify to alert time to start in mornig
          if (
            regimenPatient.state ==
            Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING
          ) {
            //notify to alert time to continues in morning
            NotifyUtils.cancelAll();
            NotifyUtils.sendScheduleAnswer(
              new Date(this.state.startTimeStep),
              'Đã tới giờ để bắt đầu ' +
                this.props.regimenInfo.regimenInfo.regimensteps[this.state.step]
                  .name +
                '',
              'Nhắc lịch',
              'Xác nhận',
              'Phác đồ',
              'Regimen',
              this.state.patientId,
              'time',
              300000,
            );
            console.log(
              'Start time morning:' + new Date(startTimeMorning).toString(),
            );
            this.stopTimer();
          } else {
            //done tinh thoi gian tuong lai de gui
            var timeSecond =
              this.props.regimenInfo.regimenInfo.regimensteps[this.state.step]
                .time *
              60 *
              1000;
            var currentTime = new Date();
            var finishTime = this.state.startTimeStep + timeSecond;
            var timeProgress = finishTime - currentTime;
            NotifyUtils.cancelAll();
            NotifyUtils.sendScheduleAnswer(
              new Date(new Date().getTime() + timeProgress),
              'Bạn đã hoàn thành ' +
                this.props.regimenInfo.regimenInfo.regimensteps[this.state.step]
                  .name +
                ' chưa?',
              'Bạn đã hoàn thành ' +
                this.props.regimenInfo.regimenInfo.regimensteps[this.state.step]
                  .name +
                ' chưa?',
              'Xác nhận',
              'Bắt đầu uống thuốc',
              'Regimen',
              this.state.patientId,
              'time',
              300000,
            );
          }
        },
      );
    } else {
      this.setState({finish: true}, async () => {
        var regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
        // var regimenPatient = this.state.regimenPatient;
        regimenPatient.current_step = this.state.step;
        regimenPatient.start_time = new Date(this.state.startTimeStep);
        // regimenPatient.state = Constants.PATIENT_STATE_CONFIRM;
        let finalStep =
          this.props.regimenInfo.regimenInfo.regimensteps.length - 1;
        let step_timing = regimenPatient.step_timing;
        let jsonStepTiming = [];
        if (
          step_timing != null &&
          step_timing !== undefined &&
          step_timing !== ''
        ) {
          try {
            jsonStepTiming = JSON.parse(step_timing);
          } catch (error) {
            //FIXME report error to database
            console.log('Error:' + error);
          }
        }
        jsonStepTiming[finalStep] = {
          ...jsonStepTiming[finalStep],
          end_time: new Date().getTime(),
        };
        regimenPatient.step_timing = JSON.stringify(jsonStepTiming);
        var response = await PatientController.updateRegimenPatientFields(
          regimenPatient.patient_regimen_id,
          [
            {
              key: 'current_step',
              value: regimenPatient.current_step,
            },
            {
              key: 'start_time',
              value: regimenPatient.start_time,
            },
            {
              key: 'step_timing',
              value: regimenPatient.step_timing,
            },
          ],
        );
        // //done check response
        if (response == null) {
          alert(
            'Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này',
          );
          return;
        }
        var jsonResponse = await response.json();
        console.log(
          'Update regimenPatient response ' + JSON.stringify(jsonResponse),
        );
        if (
          jsonResponse != null &&
          jsonResponse !== undefined &&
          jsonResponse.affectedRows > 0
        ) {
          //sync to redux
          store.dispatch(actions.storeRegimenPatient(regimenPatient));
          //save to storage if query success
          await StorageUtils.storeJsonData(
            'regimenPatientInfo',
            regimenPatient,
          );
        } else {
          alert(
            'Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này',
          );
          return;
        }
        //end
        this.stopTimer();
        //begin
        this.confirmFinishRegimen();
        //end
      });
    }
  };

  nextStep = validate => {
    this.setState({confirmVisible: false});
    let regimenInfo = this.props.regimenInfo.regimenInfo;
    //done check min time process to allow nextStep???
    let currentStep = regimenInfo.regimensteps[this.state.step];
    if (validate == null || validate === undefined || validate === true) {
      let processTime = new Date().getTime() - this.state.startTimeStep;
      if (processTime / 60000 < currentStep.min_time) {
        console.log(
          'new Date().getTime():' +
            new Date() +
            ' this.state.startTimeStep:' +
            new Date(this.state.startTimeStep),
        );
        this.setState({
          showOverlayCommon: true,
          textOverlayCommon:
            'Bạn chưa đủ thời gian để chuyển sang bước uống thuốc tiếp theo, vui lòng thực hiện đúng hướng dẫn',
        });
        return;
      }
      if (processTime < 0 && Math.abs(processTime) >= delayTimeFinishStep) {
        this.setState({overStepTime: true, lastSentTime: new Date()});
        return;
      }
      //ask after check enough time
      this.advanceFunctionForOverlay2 = this.confirmNextStepOK.bind(
        this,
        validate,
      );
      this.setState({
        showOverlayAdvanceCommon: true,
        textOverlayAdvanceCommon:
          'Bạn xác nhận đã hoàn thành bước này ?\nLưu ý bạn sẽ không thể quay trở lại bước này nếu đã chuyển sang bước tiếp theo.',
        textOverlayAdvance1Common: 'Từ chối',
        textOverlayAdvance2Common: 'Đồng ý',
      });
      //end
    } else {
      this.confirmNextStepOK(validate);
    }
  };

  async confirmFinishRegimenDone() {
    var regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
    // var regimenPatient = this.state.regimenPatient;

    let finalStep = this.props.regimenInfo.regimenInfo.regimensteps.length - 1;
    let step_timing = regimenPatient.step_timing;
    let jsonStepTiming = [];
    if (step_timing != null && step_timing != undefined && step_timing != '') {
      try {
        jsonStepTiming = JSON.parse(step_timing);
      } catch (error) {
        //FIXME report error to database
        if (__DEV__) {
          console.log('Error:' + error);
        }
        reporter(error);
      }
    }
    jsonStepTiming[finalStep] = {
      ...jsonStepTiming[finalStep],
      end_time: new Date().getTime(),
    };
    regimenPatient.step_timing = JSON.stringify(jsonStepTiming);
    regimenPatient.current_step = this.state.step;
    regimenPatient.start_time = new Date(this.state.startTimeStep);
    regimenPatient.state = Constants.PATIENT_STATE_CONFIRM;
    // update regimenPatient.other_data
    let jsonOtherData = {};
    try {
      jsonOtherData = JSON.parse(regimenPatient.other_data);
    } catch (error) {
      //FIXME report error to database
      if (__DEV__) {
        console.log('Error:' + error);
      }
      reporter(error);
    }
    jsonOtherData = {
      ...jsonOtherData,
      confirmRegimen: {
        waitConfirmTime: new Date().getTime() + 1 * 60000,
        endConfirmTime: new Date().getTime() + 2 * 60 * 60000,
        confirmNumber: 0,
      },
    };
    regimenPatient.other_data = JSON.stringify(jsonOtherData);
    // var response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );

    var response = await PatientController.updateRegimenPatientFields(
      regimenPatient.patient_regimen_id,
      [
        {
          key: 'state',
          value: regimenPatient.state,
        },
        {
          key: 'current_step',
          value: regimenPatient.current_step,
        },
        {
          key: 'start_time',
          value: regimenPatient.start_time,
        },
        {
          key: 'step_timing',
          value: regimenPatient.step_timing,
        },
        {
          key: 'other_data',
          value: regimenPatient.other_data,
        },
      ],
    );

    // //done check response
    if (response == null) {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }
    var jsonResponse = await response.json();
    console.log(
      'Update regimenPatient response ' + JSON.stringify(jsonResponse),
    );
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
      //HaBM2: update request
      Actions.finishRegimen({
        regimenPatient: JSON.stringify(regimenPatient),
      });
    } else {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }
  }

  confirmFinishRegimen = async () => {
    // this.setState({showOverlayFinishAll: true});
    this.advanceFunctionForOverlay2 = this.confirmFinishRegimenDone.bind(this);
    this.advanceFunctionForOverlay1 = this.commonFunc.bind(this);
    this.setState({
      showOverlayAdvanceCommon: true,
      textOverlayAdvanceCommon:
        'Bạn đã hoàn thành tất cả các bước trong phác đồ?',
      textOverlayAdvance1Common: 'Chưa xong',
      textOverlayAdvance2Common: 'Đã xong',
    });
  };

  async continueRegimenConfirmOk() {
    let regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
    let regimenInfo = this.props.regimenInfo.regimenInfo;
    // var regimenPatient = this.state.regimenPatient;
    regimenPatient.state = Constants.PATIENT_STATE_ACTIVE;
    // var response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );

    var response = await PatientController.updateRegimenPatientFields(
      regimenPatient.patient_regimen_id,
      [
        {
          key: 'state',
          value: regimenPatient.state,
        },
      ],
    );
    //done check response
    if (response == null) {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }

    var jsonResponse = await response.json();
    console.log(
      'Update regimenPatient response ' + JSON.stringify(jsonResponse),
    );

    if (
      jsonResponse != null &&
      jsonResponse != undefined &&
      jsonResponse.affectedRows > 0
    ) {
      //sync to redux
      store.dispatch(actions.storeRegimenPatient(regimenPatient));
      //save to storage if query success
      await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
    } else {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }

    this.setState(
      {
        patientId: regimenPatient.patient_id,
        regimen: this.props.regimenInfo.regimenInfo,
        step: regimenPatient.current_step,
        startTimeStep: new Date(regimenPatient.start_time).getTime(),
      },
      async () => {
        console.log(
          'regimenPatientInfo.start_time:' +
            regimenPatientInfo.start_time +
            ' convert time:' +
            new Date(this.state.startTimeStep),
        );
        //20200505 - bo sung startTimer when reactive
        this.startTimer();
        var timeSecond =
          regimenInfo.regimensteps[this.state.step].time * 60 * 1000;
        var currentTime = new Date();
        var finishTime = this.state.startTimeStep + timeSecond;
        var timeProgress = finishTime - currentTime;
        if (timeProgress < 0) {
          if (
            // this.state.showOverlayFinishStep == false &&
            this.state.showOverlay == false &&
            this.state.showOverlayFinishStep == false &&
            this.state.showOverlayCommon == false &&
            this.state.showOverlayAdvanceCommon == false
          ) {
            // console.log(
            //   '>>>>>>>>>>>>>>>>>>>>>>Sent overlay from timer<<<<<<<<<<<<<<<<<<<<',
            // );
            //ask after check enough time
            this.advanceFunctionForOverlay2 = this.confirmNextStepOK.bind(
              this,
              true,
            );
            this.setState({
              showOverlayAdvanceCommon: true,
              textOverlayAdvanceCommon:
                'Bạn xác nhận đã hoàn thành bước này ?\nLưu ý bạn sẽ không thể quay trở lại bước này nếu đã chuyển sang bước tiếp theo.',
              textOverlayAdvance1Common: 'Từ chối',
              textOverlayAdvance2Common: 'Đồng ý',
              lastSentTime: new Date().getTime(),
            });
          }

          // if (this.state.showOverlayFinishStep == false) {
          //   this.setState({
          //     showOverlayFinishStep: true,
          //     lastSentTime: new Date().getTime(),
          //   });
          // }
        }
      },
    );
  }

  continueRegimen = () => {
    // this.setState({showOverlayConfirmContinueRegimen: true});
    //TODO test using same overlay
    this.advanceFunctionForOverlay2 = this.continueRegimenConfirmOk.bind(this);
    this.setState({
      showOverlayAdvanceCommon: true,
      textOverlayAdvanceCommon: 'Chắc chắn muốn chạy tiếp phác đồ chứ?',
      textOverlayAdvance1Common: 'Không',
      textOverlayAdvance2Common: 'Đồng ý',
    });
    //end
  };

  startStepOK = async () => {
    let regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
    //20200505 - clear alert if press
    NotifyUtils.cancelAll();
    regimenPatient.state = Constants.PATIENT_STATE_ACTIVE;
    //change step timing
    let step_timing = regimenPatient.step_timing;
    let jsonStepTiming = [];
    if (step_timing != null && step_timing != undefined && step_timing != '') {
      try {
        jsonStepTiming = JSON.parse(step_timing);
      } catch (error) {
        //FIXME report error to database
        // console.log('Error:' + error);
      }
    }
    //re-update  start_time of new step
    jsonStepTiming[this.state.step] = {
      start_time: new Date(regimenPatient.start_time).getTime(),
    };
    regimenPatient.step_timing = JSON.stringify(jsonStepTiming);

    //end
    // var response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );

    var response = await PatientController.updateRegimenPatientFields(
      regimenPatient.patient_regimen_id,
      [
        {
          key: 'state',
          value: regimenPatient.state,
        },
        {
          key: 'step_timing',
          value: regimenPatient.step_timing,
        },
      ],
    );

    //done check response
    if (response == null) {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }

    var jsonResponse = await response.json();
    console.log(
      'Update regimenPatient response ' + JSON.stringify(jsonResponse),
    );

    if (
      jsonResponse != null &&
      jsonResponse != undefined &&
      jsonResponse.affectedRows > 0
    ) {
      //sync to redux
      store.dispatch(actions.storeRegimenPatient(regimenPatient));
      //save to storage if query success
      await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
      //20200505 - bo sung startTimer when reactive
      this.startTimer();
    } else {
      alert('Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này');
      return;
    }

    //end

    this.setState(
      {
        patientId: regimenPatient.patient_id,
        regimen: this.props.regimenInfo.regimenInfo,
        step: regimenPatient.current_step,
        startTimeStep: new Date(regimenPatient.start_time).getTime(),
      },
      async () => {
        console.log(
          'regimenPatientInfo.start_time:' +
            regimenPatientInfo.start_time +
            ' convert time:' +
            new Date(this.state.startTimeStep),
        );
        var timeSecond =
          this.state.regimen.regimensteps[this.state.step].time * 60 * 1000;
        var currentTime = new Date();
        var finishTime = this.state.startTimeStep + timeSecond;
        var timeProgress = finishTime - currentTime;
        if (timeProgress < 0) {
          // fix duplicate show overlay
          if (
            // this.state.showOverlayFinishStep == false &&
            this.state.showOverlay == false &&
            this.state.showOverlayFinishStep == false &&
            this.state.showOverlayCommon == false &&
            this.state.showOverlayAdvanceCommon == false
          ) {
            // console.log(
            //   '>>>>>>>>>>>>>>>>>>>>>>Sent overlay from timer<<<<<<<<<<<<<<<<<<<<',
            // );
            //ask after check enough time
            this.advanceFunctionForOverlay2 = this.confirmNextStepOK.bind(
              this,
              true,
            );
            this.setState({
              showOverlayAdvanceCommon: true,
              textOverlayAdvanceCommon:
                'Bạn xác nhận đã hoàn thành bước này ?\nLưu ý bạn sẽ không thể quay trở lại bước này nếu đã chuyển sang bước tiếp theo.',
              textOverlayAdvance1Common: 'Từ chối',
              textOverlayAdvance2Common: 'Đồng ý',
              lastSentTime: new Date().getTime(),
            });
          }

          // if (
          //   this.state.showOverlay == false &&
          //   this.state.showOverlayFinishStep == false &&
          //   this.state.showOverlayCommon == false &&
          //   this.state.showOverlayAdvanceCommon == false
          // ) {
          //   this.setState({
          //     showOverlayFinishStep: true,
          //     lastSentTime: new Date().getTime(),
          //   });
          // }
        }
      },
    );
  };

  getTimeString = value => {
    let datetime = new Date(value);
    let time =
      moment(datetime).format('HH') +
      ' giờ : ' +
      moment(datetime).format('mm') +
      ' phút, ';
    let date = moment(datetime).format('ngày DD/MM/YYYY');
    return time + date;
  };

  startStep = () => {
    let regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
    if (new Date().getTime() < new Date(regimenPatient.start_time).getTime()) {
      this.setState({
        showOverlayCommon: true,
        textOverlayCommon:
          'Vui lòng chờ đến ' +
          this.getTimeString(regimenPatient.start_time) +
          ' để bắt đầu uống thuốc. Hệ thống sẽ thông báo cho bạn khi thời gian tới',
      });
      return;
    }
    //bind func
    this.advanceFunctionForOverlay2 = this.startStepOK.bind(this);
    this.setState({
      showOverlayAdvanceCommon: true,
      textOverlayAdvanceCommon:
        'Chắc chắn bạn muốn bắt đầu thực hiện tiếp chứ?',
      textOverlayAdvance1Common: 'Không',
      textOverlayAdvance2Common: 'Đồng ý',
    });
  };

  suspendRegimenConfirmOK = async () => {
    let regimenPatient = store.getState().regimenPatientInfo.regimenPatientInfo;
    //Change state
    regimenPatient.state = Constants.PATIENT_STATE_ACTIVE_SUSPEND;
    // var response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );
    var response = await PatientController.updateRegimenPatientFields(
      regimenPatient.patient_regimen_id,
      [
        {
          key: 'state',
          value: regimenPatient.state,
        },
      ],
    );
    //FIXME if update return success
    console.log(
      'Start RNNotificationService to check change state of regimenPatient',
    );
    //RNNotificationService.startService();
    NotifyUtils.cancelAll();
  };

  submitIncreaseChangeStep = () => {
    this.advanceFunctionForOverlay2 = this.nextStep.bind(this);
    this.setState({
      showOverlayAdvanceCommon: true,
      textOverlayAdvanceCommon: 'Chắc chắn muốn tiến lên bước tiếp theo?',
      textOverlayAdvance1Common: 'Không',
      textOverlayAdvance2Common: 'Chấp nhận',
    });
  };

  callSupport = () => {
    this.dialCall(19008904);
  };

  dialCall = number => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber);
  };

  keyExtractor = (item, index) => index.toString();

  numberIcon = (number, numberColor, fontSize) => {
    return (
      <Text
        style={{
          textAlign: 'center',
          textAlignVertical: 'center',
          flex: 1,
          color: numberColor,
          fontSize: fontSize,
          fontWeight: 'bold',
          ...Platform.select({
            //padding top equal borderWith, leight equal 2 * frontsize
            // ios: {lineHeight: fontSize * 2, paddingTop: 5 * screenRate},
            ios: {
              lineHeight: fontSize,
              paddingTop: itemH * 0.3 - fontSize / 2 - (5 * screenRate) / 2,
              justifyContent: 'center',
            },
            android: {},
            default: {
              lineHeight: fontSize,
              paddingTop: itemH * 0.3 - fontSize / 2 - (5 * screenRate) / 2,
              justifyContent: 'center',
            },
            // default: {lineHeight: fontSize * 2, paddingTop: 5 * screenRate},
          }),
        }}>
        {number}
      </Text>
    );
  };

  renderItem = ({item, index}) => {
    return (
      <LinearGradient
        colors={
          item.done == true
            ? ['#edeff2', '#edeff2']
            : [Colors.gradientColor[index].from, Colors.gradientColor[index].to]
        }
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}>
        <View
          key={index}
          style={{
            height: itemH,
            flexDirection: 'row',
            marginHorizontal: 10,
          }}>
          <View
            style={{
              left: itemH * 0.3 + 3 * screenRate,
              borderLeftWidth: 5 * screenRate,
              borderLeftColor: '#ffffff',
              opacity: 1,
            }}
          />
          <View
            style={{
              ...styles.outerCircle,
              backgroundColor:
                item.done == true
                  ? '#ccd2db'
                  : Colors.gradientColor[index].other,
            }}>
            {this.numberIcon(
              index + 1,
              item.done == true ? '#edeff2' : '#000000',
              24 * screenRate,
            )}
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-evenly',
            }}>
            <Text
              style={{
                // paddingTop: itemH * 0.15,
                flexWrap: 'wrap',
                ...Platform.select({
                  // padding top equal borderWith, leight equal 2 * frontsize
                  ios: {lineHeight: 2 * 18 * screenRate},
                  android: {},
                  default: {lineHeight: 2 * 18 * screenRate},
                }),
                textAlignVertical: 'center',
                color: item.done == true ? '#a0a1a3' : '#000000',
                fontSize: 18 * screenRate,
                fontWeight: 'normal',
                marginLeft: 10 * screenRate,
                // flex: 0.4,
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                // paddingTop: 10,
                textAlign: 'left',
                // textAlignVertical: 'auto',
                color: item.done == true ? '#a0a1a3' : '#000000',
                fontSize: 14 * screenRate,
                fontWeight: 'normal',
                fontStyle: 'italic',
                marginLeft: 10 * screenRate,
                // flex: 0.3,
              }}>
              Bắt đầu:{' '}
              {<Text style={{fontWeight: 'bold'}}>{item.startTime}</Text>}
            </Text>
            <Text
              style={{
                // paddingTop: 10,
                textAlign: 'left',
                // textAlignVertical: 'auto',
                color: item.done == true ? '#a0a1a3' : '#000000',
                fontSize: 14 * screenRate,
                fontWeight: 'normal',
                fontStyle: 'italic',
                marginLeft: 10 * screenRate,
                // flex: 0.3,
              }}>
              Kết thúc: {<Text style={{fontWeight: 'bold'}}>{item.time}</Text>}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  openPanel = () => {
    this.setState({bottomPanelVisible: true});
  };

  closePanel = () => {
    this.setState({bottomPanelVisible: false});
  };

  renderTime(rowData, sectionID, rowID) {
    return (
      <View
        style={{
          minWidth: 10 * screenRate,
          textAlign: 'center',
        }}>
        <View
          style={{
            backgroundColor: '#009688',
            color: 'white',
            padding: 5 * screenRate,
            borderRadius: 10 * screenRate,
          }}>
          <Text style={{color: '#fff'}}>{rowData.time.format('HH:mm')}</Text>
          <View
            style={{
              borderBottomColor: '#fff',
              borderBottomWidth: 1,
            }}
          />
          <Text style={{color: '#fff'}}>{rowData.time.format('DD-MM')}</Text>
        </View>
      </View>
    );
  }

  backOvertime = () => {
    this.setState({
      overStepTime: true,
      showOverlayAdvanceCommon: false,
    });
  };

  stopWhenOvertime = () => {
    this.advanceFunctionForOverlay2 = this.suspendRegimenConfirmOK.bind(this);
    this.advanceFunctionForOverlay1 = this.backOvertime.bind(this);
    this.setState({
      overStepTime: false,
      showOverlayAdvanceCommon: true,
      textOverlayAdvanceCommon:
        'Bạn xác nhận dừng uống thuốc ? Nếu cần khởi động lại quá trình uống thuốc, vui lòng liên hệ nhân viên y tế.',
      textOverlayAdvance1Common: 'Hủy',
      textOverlayAdvance2Common: 'Đồng ý',
    });
  };

  renderDetail(rowData, sectionID, rowID) {
    let title = null;
    let desc = null;
    if (rowData.running) {
      title = (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginTop: -10 * screenRate,
          }}>
          <Text style={styles.stepTimeTitleNow}>{rowData.title}</Text>
          <View style={{flex: 0.5}}>
            <Image
              style={styles.stepTimeLogo}
              source={require('../../global/asset/icon/bell.gif')}
            />
          </View>
        </View>
      );
      desc = (
        <View>
          <Text style={styles.stepTimeDescriptionNow}>
            {rowData.description}
          </Text>
        </View>
      );
    } else {
      if (rowData.isNext) {
        title = (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginTop: -10 * screenRate,
            }}>
            <Text style={styles.stepTimeTitleNext}>{rowData.title}</Text>
          </View>
        );
        desc = (
          <View>
            <Text style={styles.stepTimeDescriptionNext}>
              {rowData.description}
            </Text>
          </View>
        );
      } else {
        title = (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginTop: -10 * screenRate,
            }}>
            <Text style={styles.stepTimeTitleDone}>{rowData.title}</Text>
            <View style={{flex: 0.5}}>
              <Image
                style={styles.stepTimeLogo}
                source={require('../../global/asset/icon/tick.png')}
              />
            </View>
          </View>
        );
        desc = (
          <View>
            <Text style={styles.stepTimeDescriptionDone}>
              {rowData.description}
            </Text>
          </View>
        );
      }
    }
    return (
      <View style={{flex: 1, paddingRight: 5 * screenRate}}>
        {title}
        {desc}
      </View>
    );
  }

  checkEndStep = () => {
    let timeSecond =
      this.state.regimen.regimensteps[this.state.step].time * 60 * 1000;
    let currentTime = new Date();
    let finishTime = this.state.startTimeStep + timeSecond;
    let timeProgress = finishTime - currentTime;
    console.log('End Step : ' + timeProgress);
    let isDelay =
      timeProgress < 0 && Math.abs(timeProgress) >= delayTimeFinishStep;
    if (isDelay) {
      this.setState({overStepTime: true, endStepTime: false});
    } else {
      this.confirmNextStepOK();
    }
  };

  componentDidMount() {
    // this.props.navigation.setParams({
    //   right: this.renderRightElement,
    // });
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    this.loadRegimenData();
  }

  showOverlay = () => {
    this.setState({
      showOverlay: true,
    });
  };

  closeOverlay = () => {
    this.setState({
      showOverlay: false,
    });
  };

  renderRightElement = () => {
    return (
      <View style={{flex: 1, flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // borderTopColor: 'white',
            paddingRight: 20 * screenRate,
            padding: 5 * screenRate,
          }}
          onPress={() => this.showOverlay()}>
          <Image
            source={require('../../global/asset/images/SOS.png')}
            style={{
              width: 40 * screenRate,
              height: 40 * screenRate,
              paddingRight: 5 * screenRate,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    let regimenPatient = this.props.regimenPatientInfo.regimenPatientInfo;
    if (regimenPatient == null || regimenPatient === undefined) {
      return (
        <View style={styles.loadingForm}>
          <ActivityIndicator size="large" />
          <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
        </View>
      );
    }
    let index = this.state.step;
    let item = undefined;
    if (index != null && index !== undefined) {
      item = this.state.data[index];
    }
    return this.state.isLoading ? (
      <View style={styles.loadingForm}>
        <ActivityIndicator size="large" />
        <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
      </View>
    ) : (
      <Swiper
        ref={swiper => {
          this.swiper = swiper;
        }}
        showsButtons={false}
        showsPagination={false}
        loop={false}
        nextButton={
          <Text
            style={{fontSize: 50 * screenRate, color: '#2C7770', opacity: 1}}>
            ›
          </Text>
        }
        prevButton={
          <Text
            style={{fontSize: 50 * screenRate, color: '#2C7770', opacity: 1}}>
            ‹
          </Text>
        }>
        <View
          style={{
            ...styles.secondView,
            backgroundColor: Colors.gradientColor[index].from,
          }}>
          <Overlay
            isVisible={this.state.showOverlay}
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>{'Xác nhận?'}</Text>
              <Text style={styles.overlayContentText}>
                Bạn gặp phải triệu chứng bất thường trong quá trình uống thuốc?
                {'\n'}Hãy liên hệ nhân viên y tế ngay để được tư vấn kịp thời.
                {'\n'}Phác đồ sẽ tạm thời dừng lại.
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => this.closeOverlay()}>
                  <Text style={styles.overlayTextNormal}>Không</Text>
                </TouchableOpacity>
                <View style={styles.overlayLineVertical} />
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={async () => {
                    await this.suspendRegimenConfirmOK();
                    // let phoneNumber = '';
                    // if (Platform.OS === 'android') {
                    //   phoneNumber = `tel:${19008904}`;
                    // } else {
                    //   phoneNumber = `telprompt:${19008904}`;
                    // }
                    // Linking.openURL(phoneNumber);
                    this.closeOverlay();
                  }}>
                  <Text style={styles.overlayText}>Có</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          {/* Alert overtime level 1 */}
          <Overlay
            isVisible={
              this.state.isVisibleAlertOverTimeLevel1 == true &&
              this.state.isVisibleAlertOverTimeLevel2_1 != true &&
              this.state.isVisibleAlertOverTimeLevel2_2 != true
            }
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>{'Xác nhận?'}</Text>
              <Text style={styles.overlayContentText}>
                {'Bạn đã quá thời gian ở bước này nhưng vẫn đủ điều kiện để tiếp tục bước tiếp theo.' +
                  '\r\nXin lưu ý việc thực hiện không đúng theo thời gian có thể làm ảnh hưởng đến mức độ sạch.'}
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButtonOnlyOne}
                  onPress={async () => {
                    this.setState({
                      isVisibleAlertOverTimeLevel1: false,
                      isVisibleAlertOverTimeLevel2_1: false,
                      isVisibleAlertOverTimeLevel2_2: false,
                    });
                  }}>
                  <Text style={styles.overlayText}>Đồng ý</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          {/* Overlay over time level 2.1 */}
          <Overlay
            isVisible={
              this.state.isVisibleAlertOverTimeLevel2_1 == true &&
              this.state.isVisibleAlertOverTimeLevel2_2 != true
            }
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>{'Xác nhận?'}</Text>
              <Text style={styles.overlayContentText}>
                {'Bạn đã quá thời gian thực hiện bước này, bạn có xác nhận tình' +
                  ' trạng này không?'}
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButtonOnlyOne}
                  onPress={async () => {
                    this.setState({
                      isVisibleAlertOverTimeLevel1: false,
                      isVisibleAlertOverTimeLevel2_1: false,
                      isVisibleAlertOverTimeLevel2_2: true,
                    });
                  }}>
                  <Text style={styles.overlayText}>Đồng ý</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          {/* Overlay over time level 2.2 */}
          <Overlay
            isVisible={this.state.isVisibleAlertOverTimeLevel2_2 == true}
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>{'Xác nhận?'}</Text>
              <Text style={styles.overlayContentText}>
                {'Nếu có dấu hiệu bất thường xin liên hệ nhân viên y tế.\r\n' +
                  'Bạn có chắc chắn muốn tiến hành bước tiếp theo không?' +
                  ' Xin lưu ý việc thực hiện không đúng theo thời gian có thể làm ảnh hưởng đến mức' +
                  ' độ sạch và bạn có thể sẽ không đủ điều kiện nội soi'}
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({
                      isVisibleAlertOverTimeLevel2_1: false,
                      isVisibleAlertOverTimeLevel2_2: false,
                    });
                  }}>
                  <Text style={styles.overlayTextNormal}>Từ chối</Text>
                </TouchableOpacity>
                <View style={styles.overlayLineVertical} />
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState(
                      {
                        isVisibleAlertOverTimeLevel2_1: false,
                        isVisibleAlertOverTimeLevel2_2: false,
                      },
                      () => {
                        this.nextStep(false);
                      },
                    );
                  }}>
                  <Text style={styles.overlayText}>Đồng ý</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          {/* Alert notify for all common */}
          <Overlay
            isVisible={this.state.showOverlayCommon}
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>
                {this.state.textOverlayCommonHeader}
              </Text>
              <Text style={styles.overlayContentText}>
                {this.state.textOverlayCommon}
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButtonOnlyOne}
                  onPress={() => {
                    this.setState({
                      showOverlayCommon: false,
                      textOverlayCommon: 'Whatsapp!!!',
                    });
                  }}>
                  <Text
                    style={styles.overlayText}
                    onPress={() => {
                      this.setState({
                        showOverlayCommon: false,
                        textOverlayCommon: 'Whatsapp!!!',
                      });
                    }}>
                    Đồng ý
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          {/* Overlay for all common with two action */}
          <Overlay
            isVisible={this.state.showOverlayAdvanceCommon}
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>
                {this.state.textOverlayAdvanceCommonHeader}
              </Text>
              <Text style={styles.overlayContentText}>
                {this.state.textOverlayAdvanceCommon}
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View
                style={{flexDirection: 'row', alignContent: 'space-around'}}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.advanceFunctionForOverlay1();
                    this.setState({showOverlayAdvanceCommon: false});
                  }}>
                  <Text
                    style={styles.overlayTextNormal}
                    // onPress={() => {
                    //   this.advanceFunctionForOverlay1();
                    //   this.setState({showOverlayAdvanceCommon: false});
                    // }}
                  >
                    {this.state.textOverlayAdvance1Common}
                  </Text>
                </TouchableOpacity>

                <View style={styles.overlayLineVertical} />

                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.advanceFunctionForOverlay2();
                    this.setState({showOverlayAdvanceCommon: false});
                  }}>
                  <Text
                    style={styles.overlayText}
                    // onPress={() => {
                    //   this.advanceFunctionForOverlay2();
                    //   this.setState({showOverlayAdvanceCommon: false});
                    // }}
                  >
                    {this.state.textOverlayAdvance2Common}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          <Overlay
            isVisible={this.state.overStepTime}
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>{'Xác nhận?'}</Text>
              <Text style={styles.overlayContentText}>
                {
                  'Thời gian uống thuốc của bạn vượt quá thời gian hướng dẫn. Lưu ý uống thuốc không đúng thời gian có thể ảnh hưởng đến độ sạch của đại tràng.\nVui lòng liên hệ nhân viên y tế nếu có dấu hiệu bất thường.'
                }
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View
                style={{flexDirection: 'row', alignContent: 'space-around'}}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({overStepTime: false}, () =>
                      this.stopWhenOvertime(),
                    );
                  }}>
                  <Text
                    style={{
                      color: '#2f59a7',
                      alignSelf: 'center',
                      fontSize: 18 * screenRate,
                      fontWeight: 'normal',
                    }}>
                    Dừng làm sạch{'\n'}đại tràng
                  </Text>
                </TouchableOpacity>
                <View style={styles.overlayLineVertical} />
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({overStepTime: false}, () =>
                      this.confirmNextStepOK(false),
                    );
                  }}>
                  <Text
                    style={{
                      color: '#2f59a7',
                      alignSelf: 'center',
                      fontSize: 18 * screenRate,
                      fontWeight: 'bold',
                    }}>
                    Tiếp tục{'\n'}uống thuốc
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          <Overlay
            isVisible={this.state.endStepTime}
            height="auto"
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>{'Xác nhận?'}</Text>
              <Text style={styles.overlayContentText}>
                {
                  'Bạn xác nhận đã hoàn thành bước này ?\nLưu ý bạn sẽ không thể quay trở lại bước này nếu đã chuyển sang bước tiếp theo.'
                }
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View
                style={{flexDirection: 'row', alignContent: 'space-around'}}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({endStepTime: false});
                  }}>
                  <Text
                    style={{
                      color: '#2f59a7',
                      alignSelf: 'center',
                      fontSize: 18 * screenRate,
                      fontWeight: 'normal',
                    }}>
                    Từ chối
                  </Text>
                </TouchableOpacity>
                <View style={styles.overlayLineVertical} />
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({endStepTime: false}, () => {
                      this.checkEndStep();
                    });
                  }}>
                  <Text
                    style={{
                      color: '#2f59a7',
                      alignSelf: 'center',
                      fontSize: 18 * screenRate,
                      fontWeight: 'bold',
                    }}>
                    Đồng ý
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>

          <View
            style={{
              justifyContent: 'center',
              marginBottom: 5 * screenRate,
            }}>
            <Text
              style={{
                marginTop: 5 * screenRate,
                textAlign: 'center',
                color: '#000000',
                fontSize: 20 * screenRate,
                fontWeight: 'bold',
              }}>
              BẮT ĐẦU LÀM SẠCH ĐẠI TRÀNG
            </Text>
          </View>

          <LinearGradient
            colors={
              item.done == true
                ? ['#edeff2', '#edeff2']
                : [
                    Colors.gradientColor[index].from,
                    Colors.gradientColor[index].to,
                  ]
            }
            start={{x: 1, y: 0}}
            end={{x: 0, y: 0}}
            width={deviceW}>
            <View
              key={index}
              style={{
                height: 1.8 * itemH,
                flexDirection: 'row',
                marginHorizontal: 5 * screenRate,
              }}>
              {/* <View
                style={{
                  left: itemH * 0.3 + 3,
                  borderLeftWidth: 5,
                  borderLeftColor: '#ffffff',
                  opacity: 1,
                }}
              /> */}
              <View
                style={{
                  ...styles.outerCircle,
                  backgroundColor: Colors.gradientColor[index].other,
                }}>
                {this.numberIcon(index + 1, '#000000', 24 * screenRate)}
              </View>

              <ScrollView
                style={{flexDirection: 'column', alignContent: 'space-around'}}>
                <Text
                  style={{
                    // paddingTop: itemH * 0.15,
                    textAlign: 'left',
                    textAlignVertical: 'center',
                    color: item.done == true ? '#a0a1a3' : '#000000',
                    fontSize: 20 * screenRate,
                    fontWeight: 'bold',
                    marginLeft: 10 * screenRate,
                    flex: 0.3,
                  }}>
                  {item.title}
                </Text>
                {regimenPatient.state ==
                  Constants.PATIENT_STATE_ACTIVE_SUSPEND && (
                  <Text
                    style={{
                      // paddingTop: itemH * 0.15,
                      textAlign: 'left',
                      textAlignVertical: 'center',
                      color: '#F25C5C',
                      fontSize: 20 * screenRate,
                      fontWeight: 'bold',
                      marginLeft: 10 * screenRate,
                      flex: 0.3,
                    }}>
                    {
                      'Phác đồ đang tạm dừng. Vui lòng liên hệ nhân viên y tế để tiếp tục uống thuốc và kích hoạt lại ứng dụng'
                    }
                  </Text>
                )}
                {regimenPatient.state ==
                  Constants.PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE && (
                  <Text
                    style={{
                      // paddingTop: itemH * 0.15,
                      textAlign: 'left',
                      textAlignVertical: 'center',
                      color: '#F25C5C',
                      fontSize: 20 * screenRate,
                      fontWeight: 'bold',
                      marginLeft: 10 * screenRate,
                      flex: 0.3,
                    }}>
                    {
                      'Phác đồ đang tạm dừng. Vui lòng liên hệ nhân viên y tế để tiếp tục uống thuốc và kích hoạt lại ứng dụng'
                    }
                  </Text>
                )}
                <Text
                  style={{
                    // paddingTop: 10,
                    textAlign: 'left',
                    textAlignVertical: 'auto',
                    color: item.done == true ? '#a0a1a3' : '#000000',
                    fontSize: 16 * screenRate,
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    marginLeft: 10 * screenRate,
                    flex: 0.2,
                  }}>
                  Bắt đầu:{' '}
                  <Text style={{fontWeight: 'bold'}}>{item.startTime}</Text>
                </Text>
                <Text
                  style={{
                    // paddingTop: 10,
                    textAlign: 'left',
                    textAlignVertical: 'auto',
                    color: item.done == true ? '#a0a1a3' : '#000000',
                    fontSize: 16 * screenRate,
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    marginLeft: 10 * screenRate,
                    flex: 0.2,
                  }}>
                  Kết thúc:{' '}
                  <Text style={{fontWeight: 'bold'}}>{item.time}</Text>
                </Text>
                <Text
                  style={{
                    // paddingTop: 10,
                    textAlign: 'left',
                    textAlignVertical: 'auto',
                    color: '#a30316',
                    fontSize: 16 * screenRate,
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    marginLeft: 10 * screenRate,
                    flex: 0.3,
                  }}>
                  Hướng dẫn:{' '}
                  <Text style={{fontWeight: 'normal', color: '#000000'}}>
                    {item.description}
                  </Text>
                </Text>
              </ScrollView>
            </View>
          </LinearGradient>

          {/* <View style={styles.stepTitle}>
            <View
              style={{
                backgroundColor: '#F2CD5C',
                // backgroundColor:'transparent',
                justifyContent: 'center',
                marginBottom: 10,
                height: 50,
              }}>
              <Text style={styles.stepTilteName}>
                {this.state.regimen.regimensteps[this.state.step].name}
              </Text>
            </View>

            {regimenPatient.state ==
              Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING &&
              new Date().getTime() <
                new Date(regimenPatient.start_time).getTime() && (
                <Text
                  style={{...styles.buttonText, color: 'red', fontSize: 20}}>
                  Vui lòng chờ sau{' \n'}
                  {moment(new Date(regimenPatient.start_time)).format(
                    'YYYY-MM-DD HH:mm:00',
                  )}{' '}
                  để tiếp tục
                </Text>
              )}
            {regimenPatient.state == Constants.PATIENT_STATE_ACTIVE_SUSPEND && (
              <Text
                style={{
                  ...styles.buttonText,
                  color: 'red',
                  fontSize: 20,
                  paddingHorizontal: 40,
                }}>
                {
                  'Quá trình chuẩn bị đang bị dừng lại. Nhấn nút "Tiếp tục phác đồ" để tiếp tục quá trình'
                }
              </Text>
            )}

            {regimenPatient.state !=
              Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING &&
              regimenPatient.state != Constants.PATIENT_STATE_ACTIVE_SUSPEND &&
              this.state.isMiss && (
                <Text style={styles.timerAlert}>Cảnh báo quá thời gian !</Text>
              )}
            {regimenPatient.state !=
              Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING &&
              regimenPatient.state !=
                Constants.PATIENT_STATE_ACTIVE_SUSPEND && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View style={styles.timerBlock}>
                    <View style={styles.timerFrame}>
                      <Text style={styles.timerText}>{this.state.hour}</Text>
                    </View>
                    <Text style={styles.timerLabel}>Giờ</Text>
                  </View>
                  <View style={styles.timerBlock}>
                    <View style={styles.timerFrame}>
                      <Text style={styles.timerText}>{this.state.minute}</Text>
                    </View>
                    <Text style={styles.timerLabel}>Phút</Text>
                  </View>
                  <View style={styles.timerBlock}>
                    <View style={styles.timerFrame}>
                      <Text style={styles.timerText}>{this.state.second}</Text>
                    </View>
                    <Text style={styles.timerLabel}>Giây</Text>
                  </View>
                </View>
              )}
          </View> */}
          <View style={styles.stepImage}>
            {this.state.stepImage != undefined &&
              this.state.stepImage != '' && (
                <ImageBackground
                  resizeMode="contain"
                  style={{flex: 1}}
                  source={{uri: this.state.stepImage}}
                />
              )}
          </View>

          <View
            style={{
              ...styles.overlayRowDirection,
              width: deviceW,
              backgroundColor: '#ffffff',
              justifyContent: 'space-around',
              padding: 5 * screenRate,
            }}>
            <Button
              onPress={() => this.showOverlay()}
              buttonStyle={{
                backgroundColor: '#F25C5C',
                width: 0.2 * deviceW,
                alignSelf: 'center',
                marginVertical: 15 * screenRate,
                height: 0.45 * itemH,
                borderRadius: 5,
              }}
              containerStyle={{flex: 0.2}}
              // icon={{name: 'history', color: 'white'}}
              title={this.numberIcon('SOS', 'white', 20 * screenRate)}
              titleStyle={{
                textAlign: 'center',
                textAlignVertical: 'center',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 'normal',
              }}
            />
            {/* {regimenPatient.state == Constants.PATIENT_STATE_ACTIVE_SUSPEND && (
              <Button
                onPress={() => this.continueRegimen()}
                buttonStyle={{
                  backgroundColor: '#03A678',
                  width: 0.25 * deviceW,
                  alignSelf: 'center',
                  marginVertical: 15 * screenRate,
                  height: 0.45 * itemH,
                  borderRadius: 5,
                }}
                containerStyle={{flex: 0.25}}
                // icon={{name: 'history', color: 'white'}}
                title={'Tiếp tục\r\nphác đồ'}
                titleStyle={{
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: 14 * screenRate,
                  fontWeight: 'normal',
                }}
              />
            )} */}
            {regimenPatient.state ==
              Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING && (
              // new Date().getTime() >
              //   new Date(regimenPatient.start_time).getTime() &&
              <Button
                onPress={() => this.startStep()}
                buttonStyle={{
                  backgroundColor: '#03A678',
                  width: 0.25 * deviceW,
                  alignSelf: 'center',
                  marginVertical: 15 * screenRate,
                  height: 0.45 * itemH,
                  borderRadius: 5,
                }}
                containerStyle={{flex: 0.25}}
                // icon={{name: 'history', color: 'white'}}
                title={'Tiếp tục'}
                titleStyle={{
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: 14 * screenRate,
                  fontWeight: 'normal',
                }}
              />
            )}
            {regimenPatient.state == Constants.PATIENT_STATE_ACTIVE && (
              <Button
                onPress={() => this.nextStep()}
                buttonStyle={{
                  backgroundColor: '#03A678',
                  width: 0.25 * deviceW,
                  alignSelf: 'center',
                  marginVertical: 15 * screenRate,
                  height: 0.45 * itemH,
                  borderRadius: 5,
                }}
                containerStyle={{flex: 0.25}}
                // icon={{name: 'history', color: 'white'}}
                title={'Đã xong\r\nbước này'}
                titleStyle={{
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: 14 * screenRate,
                  fontWeight: 'normal',
                }}
              />
            )}

            {/* //TODO coding dung lam sach dai trang */}
            {/* {regimenPatient.state !=
              Constants.PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE && (
              <Button
                onPress={() => {
                  //ask after check enough time
                  this.advanceFunctionForOverlay2 = this.suspendRegimenConfirmOK.bind(
                    this,
                  );
                  this.advanceFunctionForOverlay1 = this.commonFunc.bind(this);
                  this.setState({
                    showOverlayAdvanceCommon: true,
                    textOverlayAdvanceCommon:
                      'Bạn xác nhận dừng uống thuốc? Nếu cần khởi động lại quá trình uống thuốc, vui lòng liên hệ nhân viên y tế.',
                    textOverlayAdvance1Common: 'Từ chối',
                    textOverlayAdvance2Common: 'Đồng ý',
                  });
                }}
                buttonStyle={{
                  backgroundColor: '#03A678',
                  width: 0.2 * deviceW,
                  alignSelf: 'center',
                  marginVertical: 15 * screenRate,
                  height: 0.45 * itemH,
                  borderRadius: 5,
                }}
                containerStyle={{flex: 0.2}}
                // icon={{name: 'history', color: 'white'}}
                title={'Dừng'}
                titleStyle={{
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: 14 * screenRate,
                  fontWeight: 'normal',
                }}
              />
            )} */}
            <Button
              onPress={() => this.swiper.scrollBy(1, true)}
              buttonStyle={{
                backgroundColor: '#03A678',
                width: 0.2 * deviceW,
                alignSelf: 'center',
                marginVertical: 15 * screenRate,
                height: 0.45 * itemH,
                borderRadius: 5,
              }}
              containerStyle={{flex: 0.2}}
              // icon={{name: 'history', color: 'white'}}
              title={'Chi tiết'}
              titleStyle={{
                textAlign: 'center',
                color: '#ffffff',
                fontSize: 14 * screenRate,
                fontWeight: 'normal',
              }}
            />
          </View>
        </View>

        <View style={styles.firstView}>
          <View style={styles.wrapper}>
            {this.props.regimenInfo != null && (
              <View
                style={{
                  backgroundColor: 'transparent',
                  justifyContent: 'center',
                  marginBottom: 10 * screenRate,
                  height: 0.5 * itemH,
                }}>
                <Text style={styles.titlePage}>{this.state.regimen.name}</Text>
              </View>
            )}
            {this.state.data == null || this.state.data.length === 0 ? (
              <View style={styles.item}>
                <Text style={styles.title}>Đang cập nhật nội dung</Text>
              </View>
            ) : (
              <View style={styles.container}>
                <FlatList
                  keyExtractor={this.keyExtractor}
                  data={this.state.data}
                  renderItem={this.renderItem}
                />

                {/* <Timeline
                  style={styles.list}
                  data={this.state.data}
                  circleSize={20}
                  separator={true}
                  circleColor="rgb(45,156,219)"
                  lineColor="rgb(45,156,219)"
                  timeContainerStyle={{minWidth: 10, marginTop: 0}}
                  descriptionStyle={{color: 'gray', fontSize: 14}}
                  options={{
                    style: {paddingTop: 5},
                  }}
                  innerCircle={'dot'}
                  renderTime={this.renderTime}
                  renderDetail={this.renderDetail}
                /> */}
                <View style={styles.overlayRowDirection}>
                  <Button
                    onPress={() => this.openPanel()}
                    buttonStyle={{
                      backgroundColor: '#03A678',
                      width: 0.4 * deviceW,
                      alignSelf: 'center',
                      marginVertical: 15 * screenRate,
                      height: 0.4 * itemH,
                      borderRadius: 5,
                    }}
                    containerStyle={{flex: 0.5}}
                    icon={{name: 'comment', color: 'white'}}
                    title="Lưu ý"
                    titleStyle={{
                      textAlign: 'center',
                      color: '#ffffff',
                      fontSize: 14 * screenRate,
                      fontWeight: 'normal',
                    }}
                  />
                  <Button
                    onPress={() => this.swiper.scrollBy(-1, true)}
                    buttonStyle={{
                      backgroundColor: '#03A678',
                      width: 0.4 * deviceW,
                      alignSelf: 'center',
                      marginVertical: 15 * screenRate,
                      height: 0.4 * itemH,
                      borderRadius: 5,
                      justifyContent: 'center',
                    }}
                    containerStyle={{flex: 0.5}}
                    icon={{name: 'reply', color: 'white'}}
                    title="Quay lại"
                    titleStyle={{
                      textAlign: 'center',
                      color: '#ffffff',
                      fontSize: 14 * screenRate,
                      fontWeight: 'normal',
                    }}
                  />
                </View>
                <Overlay
                  isVisible={this.state.bottomPanelVisible}
                  height="auto"
                  width={0.95 * deviceW}
                  overlayBackgroundColor="transparent"
                  overlayStyle={{elevation: 0, shadowOpacity: 0}}
                  style={styles.overlay}>
                  <View style={styles.overlayContainer}>
                    <Text style={styles.overlayHeaderText}>{'LƯU Ý'}</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                      <Text style={styles.overlayContentText}>
                        {this.state.regimen.note}
                        {/* {' '}
                        {this.state.atClinic == 'home' && (
                          <Image
                            style={styles.imageInline}
                            source={require('../../global/asset/images/sos.png')}
                          />
                        )} */}
                      </Text>
                    </View>
                    <View style={styles.overlayLineHorizonal} />
                    <View style={styles.overlayRowDirection}>
                      <TouchableOpacity
                        style={styles.overlayButtonOnlyOne}
                        onPress={this.closePanel}>
                        <Text style={styles.overlayTextNormal}>Đóng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Overlay>
                {/* <SwipeablePanel
                  onlyLarge={true}
                  showCloseButton={true}
                  fullWidth={true}
                  isActive={this.state.bottomPanelVisible}
                  onClose={this.closePanel}
                  onPressCloseButton={this.closePanel}>
                  <Image
                    style={styles.warningIcon}
                    source={require('../../global/asset/icon/warning.png')}
                  />
                  <View style={styles.noticeForm}>
                    <Text style={styles.titleText}>Thông tin cần lưu ý</Text>
                    <Text style={styles.noticeContent}>
                      {this.state.regimen.note}
                    </Text>
                  </View>
                </SwipeablePanel> */}
              </View>
            )}
          </View>
        </View>
      </Swiper>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  filterRegimen: state.filterRegimen,
  regimenInfo: state.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(ActiveRegimen);

export const headerBasic = {
  fontSize: 20 * screenRate,
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
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flex: 1,
  },
  titlePage: {
    fontSize: 18 * screenRate,
    color: '#2C7770',
    fontWeight: 'bold',
    paddingVertical: 5 * screenRate,
    marginHorizontal: 5 * screenRate,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  list: {
    width: '100%',
    marginHorizontal: 10 * screenRate,
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
  warningIcon: {
    height: 60 * screenRate,
    width: 60 * screenRate,
    alignSelf: 'center',
  },
  errorIcon: {
    height: 90 * screenRate,
    width: 90 * screenRate,
    alignSelf: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18 * screenRate,
    marginVertical: 10 * screenRate,
    color: '#2C7770',
  },
  noticeForm: {
    marginVertical: 10 * screenRate,
  },
  noticeContent: {
    paddingHorizontal: 5 * screenRate,
    textAlign: 'justify',
    color: '#2C7770',
    fontSize: 16 * screenRate,
  },
  contentAlert: {
    marginVertical: 20 * screenRate,
    fontSize: 18 * screenRate,
    color: '#2C7770',
    textAlign: 'justify',
  },
  titleAlert: {
    fontWeight: 'bold',
    color: '#cb3837',
    fontSize: 20 * screenRate,
    textAlign: 'center',
    marginTop: 0,
    marginHorizontal: 10 * screenRate,
  },
  timerBlock: {
    marginHorizontal: 10 * screenRate,
  },
  timerFrame: {
    width: 60 * screenRate,
    height: 60 * screenRate,
    backgroundColor: '#2C7770',
    borderRadius: 10 * screenRate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 30 * screenRate,
  },
  timerLabel: {
    textAlign: 'center',
    fontSize: 18 * screenRate,
    color: '#2C7770',
  },
  timerAlert: {
    textAlign: 'center',
    fontSize: 20 * screenRate,
    color: '#cb3837',
    marginTop: -5,
    marginBottom: 5,
  },
  titleText: {
    textAlign: 'center',
    color: '#2C7770',
    fontSize: 18 * screenRate,
    fontWeight: 'bold',
  },
  hrText: {
    textAlign: 'center',
    color: '#2C7770',
    fontSize: 20 * screenRate,
    fontWeight: 'bold',
    marginRight: 20 * screenRate,
    marginLeft: 20 * screenRate,
  },
  Time: {
    // flexGrow: 1,
    fontSize: 22 * screenRate,
    color: 'red',
    padding: 5 * screenRate,
    flex: 1,
    textAlign: 'center',
    backgroundColor: Colors.sectionBackground,
  },
  header1: {
    ...headerBasic,
    paddingTop: 20 * screenRate,
  },
  note: {
    ...headerBasic,
    fontWeight: 'normal',
  },
  rowCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: '5%',
    // flex:1,
    // flexDirection: 'row',
    flexGrow: 1,
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
    alignSelf: 'center',
  },
  actionButtonIcon: {
    color: 'white',
  },
  scrollView: {
    margin: 5 * screenRate,
    backgroundColor: Colors.sectionBackground,
    marginHorizontal: 20 * screenRate,
    borderRadius: 25 * screenRate,
    width: '100%',
  },
  firstView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  secondView: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
  stepTimeLogo: {
    height: 24 * screenRate,
    width: 24 * screenRate,
  },
  stepTimeTitleDone: {
    flex: 3,
    fontWeight: 'bold',
    color: 'gray',
    fontSize: 18 * screenRate,
  },
  stepTimeDescriptionDone: {
    color: 'gray',
    fontSize: 16 * screenRate,
    marginTop: 10 * screenRate,
    paddingRight: 10 * screenRate,
  },
  stepTimeTitleNow: {
    flex: 3,
    fontWeight: 'bold',
    color: '#cb3837',
    fontSize: 18 * screenRate,
  },
  stepTimeDescriptionNow: {
    color: '#cb3837',
    fontSize: 16 * screenRate,
    marginTop: 10 * screenRate,
    paddingRight: 10 * screenRate,
  },
  stepTimeScheduleNext: {},
  stepTimeTitleNext: {
    fontWeight: 'bold',
    fontSize: 18 * screenRate,
  },
  stepTimeDescriptionNext: {
    fontSize: 16 * screenRate,
    marginTop: 10 * screenRate,
    paddingRight: 10 * screenRate,
  },
  stepTitle: {
    width: '100%',
    height: '35%',
  },
  stepImage: {
    width: '100%',
    height: '30%',
  },
  stepNote: {
    width: '100%',
    height: '35%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  stepTilteName: {
    fontWeight: 'bold',
    fontSize: 20 * screenRate,
    color: '#2C7770',
    textAlign: 'center',
    alignContent: 'center',
  },
  stepButton: {
    height: 45 * screenRate,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#2C7770',
    borderRadius: 15 * screenRate,
  },
  stepTextButton: {
    color: '#fff',
    fontSize: 18 * screenRate,
  },
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
    // fontWeight: '500',
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
  //
  containerCircle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  outerCircle: {
    borderRadius: itemH * 0.3,
    width: itemH * 0.6,
    height: itemH * 0.6,
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    marginTop: itemH * 0.2,
    borderWidth: 5 * screenRate,
  },
});
