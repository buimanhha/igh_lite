import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import moment from 'moment-timezone';
import {Actions} from 'react-native-router-flux';
import * as Constants from '../global/constants';
import * as NotifyUtils from '../global/utils/NotifyUtils';
import * as StorageUtils from '../global/utils/StorageUtils';
import * as PatientController from '../controller/PatientController';
import * as RegimenController from '../controller/RegimenController';
import {Input, Header, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as actions from '../redux/actions';
import {connect} from 'react-redux';
import store from '../redux/stores';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../controller/LogController';
import * as CommonService from '../services/CommonService';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

const deviceW = Dimensions.get('window').width;
const deviceH = Dimensions.get('window').height;
const screenRate = deviceW / 430;
const basePx = 375;

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

function px2dp(px) {
  return (px * deviceW) / basePx;
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRegimen: false,
      showConfirmActiveCode: false,
      showWarning: false,
      showNotice: false,
      contentNotice: '',
      currentActiveCode: null,
      confirmActiveCode: null,
      messageActiveCode: '',
      isLoading: true,
      regimenPatient: null,
    };
  }

  init = async () => {
    // update userInfo
    let patientId = -1;
    let userInfo = this.props.userInfo;
    if (
      userInfo == null ||
      userInfo == undefined ||
      Object.keys(userInfo).length == 0
    ) {
      userInfo = await StorageUtils.getJsonData('userInfo');
      if (userInfo != null && userInfo != undefined) {
        patientId = userInfo.patient_id;
      } else {
        this.setState({isLoading: false});
        return;
      }
    } else {
      let user = userInfo.userInfo;
      if (user != null && user != undefined && Object.keys(user).length != 0) {
        patientId = user.patient_id;
      } else {
        this.setState({isLoading: false});
        return;
      }
    }
    if (patientId >= 0) {
      this.props.queryUser({patientId: patientId});
    } else {
      this.setState({isLoading: false});
      return;
    }
  };

  showNotice = content => {
    this.setState({
      showNotice: true,
      contentNotice: content,
    });
  };

  showWarning = content => {
    this.setState({
      showWarning: true,
    });
  };

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene == '_home') {
      if (
        prevProps.userInfo !== undefined &&
        this.props.userInfo !== undefined &&
        prevProps.userInfo.loading != undefined &&
        this.props.userInfo.loading != undefined &&
        this.props.userInfo.error != undefined &&
        this.props.userInfo.loading !== prevProps.userInfo.loading
      ) {
        let error = this.props.userInfo.error;
        if (error == null || error == undefined || error != 0) {
          console.log('error init data');
        } else {
          let userInfo = this.props.userInfo.userInfo;
          await StorageUtils.storeJsonData('userInfo', userInfo);
          await store.dispatch(actions.storeUser(userInfo));
          try {
            let regimenPatient = await PatientController.getRegimenPatient(
              userInfo.patient_id,
            );
            regimenPatient = await regimenPatient.json();
            regimenPatient = regimenPatient[0];
            if (regimenPatient !== null && regimenPatient !== undefined) {
              if (regimenPatient.state >= Constants.PATIENT_STATE_IDLE) {
                this.state.activeRegimen = true;
              }
            }
          } catch (error) {
            console.log(JSON.stringify(error));
          }
        }
        this.setState({
          isLoading: false,
        });
      }
    }
  }

  async componentDidMount() {
    await this.init();
    //routeToMonitor
    let autoRoute = await StorageUtils.getData('routeToMonitor');
    // console.log('autoRoute:' + autoRoute);
    if (autoRoute == 'true') {
      StorageUtils.removeData('routeToMonitor');
      this.monitor();
      return;
    }
    //end
  }

  signup = () => {
    Actions.signup();
  };

  filter = async () => {
    let user = this.props.userInfo;
    if (CommonService.isNull(user)) {
      this.setState({isLoading: false}, () => this.showWarning());
      return;
    }
    let userInfo = user.userInfo;
    if (CommonService.isNull(userInfo)) {
      this.setState({isLoading: false}, () => this.showWarning());
      return;
    }
    //Refresh data
    let patientId = userInfo.patient_id;
    let activeCode = userInfo.ext_id;
    this.state.currentActiveCode = activeCode;
    let location = CommonService.getLocationFromCode(activeCode);
    //Get regiment of patient
    let dataRegimen = await PatientController.getRegimenPatient(patientId);
    //Kiểm tra kết nối mạng
    if (
      dataRegimen == null ||
      dataRegimen === undefined ||
      Object.keys(dataRegimen).length === 0
    ) {
      this.setState({isLoading: false}, () =>
        this.showNotice('Vui lòng kiểm tra lại kết nối mạng internet.'),
      );
      return;
    }
    let regimenPatientInfo;
    let jsonRegimen = await dataRegimen.json();
    if (
      jsonRegimen == null ||
      jsonRegimen === undefined ||
      Object.keys(jsonRegimen).length === 0
    ) {
      //Không có phác đồ
      regimenPatientInfo = {
        patient_id: patientId,
        regimen_id: CommonService.DefaultRegimen,
        state: 1,
        current_step: 0,
        active_code: activeCode,
        eff_date: null,
        exp_date: null,
        created_date: new Date(),
        updated_date: new Date(),
        org_regimen: null,
        step_timing: null,
        start_time: null,
        other_data: null,
        supporter_id: null,
        regimen_where: 'clinic',
        location_id: location,
      };
      try {
        await RegimenController.createRegimenPatient(regimenPatientInfo);
      } catch (err) {
        this.setState({isLoading: false}, () =>
          this.showNotice('Vui lòng kiểm tra lại kết nối mạng internet.'),
        );
        return;
      }
    } else {
      //Phác đồ hết hạn
      regimenPatientInfo = jsonRegimen[0];
      if (
        moment().diff(moment(regimenPatientInfo.created_date), 'day') > 7 &&
        regimenPatientInfo.regimen_id > 0
      ) {
        regimenPatientInfo = {
          patient_id: patientId,
          regimen_id: CommonService.DefaultRegimen,
          state: 1,
          current_step: 0,
          active_code: activeCode,
          eff_date: null,
          exp_date: null,
          created_date: new Date(),
          updated_date: new Date(),
          org_regimen: null,
          step_timing: null,
          start_time: null,
          other_data: null,
          supporter_id: null,
          regimen_where: 'clinic',
          location_id: location,
        };
        try {
          await RegimenController.createRegimenPatient(regimenPatientInfo);
        } catch (err) {
          this.setState({isLoading: false}, () =>
            this.showNotice('Vui lòng kiểm tra lại kết nối mạng internet.'),
          );
          return;
        }
      }
    }
    let statePatient = regimenPatientInfo.state;
    let infoQuestion = regimenPatientInfo.other_data;
    await store.dispatch(actions.storeRegimenPatient(regimenPatientInfo));
    //Trang thai benh nhan chua kick hoat phac do
    if (statePatient == null || statePatient <= Constants.PATIENT_PRE_FILTER) {
      if (
        infoQuestion === undefined ||
        infoQuestion === null ||
        infoQuestion === '' ||
        infoQuestion === '{}'
      ) {
        this.setState({isLoading: false}, () => Actions.filter());
        return;
      }
      infoQuestion = JSON.parse(regimenPatientInfo.other_data);
      this.setState({isLoading: false}, () =>
        Actions.filterResult({
          allowSave: false,
          allowRetry: regimenPatientInfo.state <= Constants.PATIENT_STATE_READY_ACTIVE,
          questions: infoQuestion.quests,
          answers: infoQuestion.answer,
        }),
      );
      return;
    }
    //Trang thai benh nhan chua tra loi cau hoi sang loc
    if (
      infoQuestion == null ||
      infoQuestion == undefined ||
      Object.keys(infoQuestion).length == 0
    ) {
      this.setState({isLoading: false}, () => Actions.filter());
      return;
    }
    infoQuestion = JSON.parse(regimenPatientInfo.other_data);
    let questions = infoQuestion.quests;
    let answers = infoQuestion.answer;
    if (
      questions == null ||
      questions == undefined ||
      Object.keys(questions).length == 0 ||
      answers == null ||
      answers == undefined ||
      Object.keys(answers).length == 0
    ) {
      this.setState({isLoading: false}, () => Actions.filter());
      return;
    } else {
      this.setState({isLoading: false}, () =>
        Actions.filterResult({
          allowSave: false,
          allowRetry:
            regimenPatientInfo.state <= Constants.PATIENT_STATE_READY_ACTIVE,
          questions: questions,
          answers: answers,
        }),
      );
    }
  };

  monitor = async () => {
    let userInfo = undefined;
    if (
      this.props.userInfo != undefined &&
      this.props.userInfo.userInfo != undefined
    ) {
      userInfo = this.props.userInfo.userInfo;
    } else {
      userInfo = await StorageUtils.getJsonData('userInfo');
    }
    if (userInfo == null || userInfo == undefined) {
      this.setState({isLoading: false}, () => this.showWarning());
      return;
    }
    let patientId = userInfo.patient_id;
    let activeCode = userInfo.ext_id;
    this.state.currentActiveCode = activeCode;
    let location = CommonService.getLocationFromCode(activeCode);
    let response = null;
    let regimenPatient = null;
    try {
      response = await PatientController.getRegimenPatient(patientId);
    } catch (err) {
      response = null;
      if (__DEV__) {
        console.log(err);
      }
      //Try to get from storage
      regimenPatient = await StorageUtils.getJsonData('regimenPatientInfo');
      if (regimenPatient != null && regimenPatient !== undefined) {
        store.dispatch(actions.storeRegimenPatient(regimenPatient));
      }
    }
    if (__DEV__) {
      console.log('GetRegimenPatient|' + response);
    }
    if (response != null) {
      var responseJson = await response.json();
      if (
        responseJson == null ||
        responseJson === undefined ||
        responseJson.length === 0
      ) {
        if (responseJson.length === 0) {
          //done create regimenInfo if not found
          let regimenPatientTmp = {
            patient_id: patientId,
            regimen_id: CommonService.DefaultRegimen,
            state: 1,
            active_code: activeCode,
            current_step: 0,
            eff_date: null,
            exp_date: null,
            created_date: new Date(),
            updated_date: new Date(),
            org_regimen: null,
            step_timing: null,
            start_time: null,
            other_data: null,
            supporter_id: null,
            regimen_where: 'clinic',
            location_id: location,
          };
          //end
          try {
            response = await RegimenController.createRegimenPatient(
              regimenPatientTmp,
            );
          } catch (err) {
            response = null;
            //TODO make module write error log to db or storage
            // console.log(err);
          }
          if (response != null) {
            responseJson = await response.json();
            if (
              responseJson != null &&
              responseJson !== undefined &&
              responseJson.insertId > 0
            ) {
              //store regiment patient to redux for other screen
              store.dispatch(actions.storeRegimenPatient(regimenPatientTmp));
              //save to storage if query success
              await StorageUtils.storeJsonData(
                'regimenPatientInfo',
                regimenPatientTmp,
              );
              regimenPatient = regimenPatientTmp;
            } else {
              // console.log('responseJson:' + JSON.stringify(responseJson));
              this.setState({isLoading: false}, () =>
                this.showNotice(
                  'Không thể tạo thông tin phác đồ, vui lòng đảm bảo điện thoại có kết nối internet để thực hiện chức năng này',
                ),
              );
              return;
            }
          }
        }
        // alert('Không tìm thấy phác đồ, cần đăng kí phác đồ trước');
        // return;
      } else {
        regimenPatient = responseJson[0];
        //store regiment patient to redux for other screen
        store.dispatch(actions.storeRegimenPatient(regimenPatient));
        //save to storage if query success
        await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
      }
    }
    if (regimenPatient != null && regimenPatient !== undefined) {
      let state = regimenPatient.state;
      let regimentId = regimenPatient.regimen_id;
      if (regimentId == null) {
        this.setState({isLoading: false}, () => this.showWarning());
        return;
      }
      //thực hiện filter trước khi chạy phác đồ
      if (state == null || state <= Constants.PATIENT_PRE_FILTER) {
        if (regimentId <= 0) {
          this.setState({isLoading: false}, () =>
            this.showNotice('Bạn chưa có phác đồ uống thuốc.'),
          );
          return;
        }
        this.setState({isLoading: false}, () =>
          this.showNotice('Bạn cần trả lời câu hỏi sàng lọc trước.'),
        );
        return;
      } else if (state === Constants.PATIENT_AFTER_FILTER_NOT_ALLOW_REGIMEN) {
        this.setState({isLoading: false}, () =>
          this.showNotice(
            'Kết quả sàng lọc của bạn không đủ điều kiện để uống thuốc. Vui lòng liên hệ nhân viên y tế để được giải đáp.',
          ),
        );
      } else if (state === Constants.PATIENT_STATE_IDLE) {
        this.setState({
          regimenPatient: regimenPatient,
          isLoading: false,
          showConfirmActiveCode: true,
        });
      } else if (state === Constants.PATIENT_STATE_READY_ACTIVE) {
        this.setState({isLoading: false}, () =>
          Actions.DetailRegimen({regimentId: regimentId}),
        );
      } else if (
        state === Constants.PATIENT_STATE_ACTIVE ||
        state === Constants.PATIENT_STATE_ACTIVE_SUSPEND ||
        state === Constants.PATIENT_STATE_WAIT_FOR_TIME_MORNING ||
        state === Constants.PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE
      ) {
        this.setState({isLoading: false}, () =>
          Actions.activeRegimen({
            active: 'true',
            regimentId: regimentId,
            regimenPatient: JSON.stringify(regimenPatient),
          }),
        );
      } else if (state === Constants.PATIENT_STATE_CONFIRM) {
        this.setState({isLoading: false}, () =>
          Actions.finishRegimen({
            regimenId: regimentId,
            regimenPatient: JSON.stringify(regimenPatient),
          }),
        );
      } else if (state === Constants.PATIENT_STATE_AFTER_CONFIRM) {
        this.setState({isLoading: false}, () => Actions.confirmFinalRegimen());
      } else if (state === Constants.PATIENT_STATE_POST_SUPPORT) {
        this.setState({isLoading: false}, () => Actions.resultRegimen());
      } else if (
        state === Constants.PATIENT_STATE_POST_SUPPORT_NOT_ENOUGH_CONDITION
      ) {
        this.setState({isLoading: false}, () => Actions.resultRegimen());
      } else if (state === Constants.PATIENT_STATE_CONFIRM_SUSPEND) {
        this.setState({isLoading: false}, () => Actions.resultRegimen());
      } else if (state === Constants.PATIENT_STATE_CONFIRM_NOT_CLEAN) {
        this.setState({isLoading: false}, () => Actions.resultRegimen());
      } else {
        this.setState({isLoading: false}, () =>
          this.showNotice(
            'Trạng thái tài khoản không đủ điều kiện. Vui lòng liên hệ nhân viên y tế để được giải đáp.',
          ),
        );
      }
    }
  };

  validateActiveCode = async () => {
    let confirmActiveCode = this.state.confirmActiveCode;
    if (CommonService.isNullOrEmptyStr(confirmActiveCode)) {
      this.setState({messageActiveCode: 'Vui lòng nhập mã số bệnh nhân !'});
      return;
    }
    confirmActiveCode = confirmActiveCode.toUpperCase();
    if (!CommonService.RegexActiveCode.test(confirmActiveCode)) {
      this.setState({
        messageActiveCode: 'Mã số không đúng cú pháp, vui lòng nhập lại !',
      });
      return;
    }
    if (confirmActiveCode !== this.state.currentActiveCode) {
      this.setState({
        messageActiveCode: 'Mã số không khớp, vui lòng nhập lại !',
      });
      return;
    }
    this.setState(
      {
        isLoading: false,
        showConfirmActiveCode: false,
      },
      () =>
        Actions.PreActiveRegimen({
          active: 'false',
          regimenPatient: JSON.stringify(this.state.regimenPatient),
          regimentId: CommonService.DefaultRegimen,
        }),
    );
  };

  renderCenterHeader = () => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: deviceW,
          marginTop: moderateScale(-25),
        }}>
        {Platform.OS !== 'android' && <StatusBar barStyle={'dark-content'} />}
        <Image
          resizeMode="contain"
          style={styles.headerLeft}
          source={require('../global/asset/logo/logoIGH.png')}
        />
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={styles.bannerText}>Sức khỏe là khởi nguồn</Text>
          <Text style={styles.bannerText}>của hạnh phúc</Text>
        </View>
        <Image
          resizeMode="contain"
          style={styles.headerRight}
          source={require('../global/asset/logo/logo.png')}
        />
      </View>
    );
  };

  render() {
    return this.state.isLoading ? (
      <View style={styles.loadingForm}>
        <ActivityIndicator size="large" />
        <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
      </View>
    ) : (
      <View style={styles.wrapper}>
        {/* <InternetNotice /> */}
        <ImageBackground
          source={require('../global/asset/images/background.jpg')}
          style={styles.background}>
          <Overlay
            height="auto"
            isVisible={this.state.showConfirmActiveCode}
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>
                Xác nhận mã số bệnh nhân
              </Text>
              <Text style={styles.overlayContentText}>
                {this.state.messageActiveCode}
              </Text>
              <Input
                value={this.state.confirmActiveCode}
                placeholder="Nhập mã số"
                leftIcon={
                  <Icon
                    name="ticket"
                    size={24}
                    color="#2C7770"
                    style={{
                      marginLeft: -10,
                      marginRight: 5,
                      marginVertical: 3,
                      width: 25,
                    }}
                  />
                }
                style={styles.contentInput}
                onChangeText={confirmActiveCode =>
                  this.setState({confirmActiveCode})
                }
              />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({
                      showConfirmActiveCode: false,
                    });
                  }}>
                  <Text style={styles.overlayTextNormal}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.overlayButtonOnlyOne}
                  onPress={() => this.validateActiveCode()}>
                  <Text style={styles.overlayText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>
          <Overlay
            height="auto"
            isVisible={this.state.showNotice}
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>Thông báo</Text>
              <Text style={styles.overlayContentText}>
                {this.state.contentNotice}
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButtonOnlyOne}
                  onPress={() => {
                    this.setState({
                      showNotice: false,
                    });
                  }}>
                  <Text style={styles.overlayText}>Đồng ý</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>
          <Overlay
            height="auto"
            isVisible={this.state.showWarning}
            overlayBackgroundColor="transparent"
            overlayStyle={{elevation: 0, shadowOpacity: 0}}
            style={styles.overlay}>
            <View style={styles.overlayContainer}>
              <Text style={styles.overlayHeaderText}>Thông báo</Text>
              <Text style={styles.overlayContentText}>
                Bạn cần đăng nhập để sử dụng tính năng này !
              </Text>
              <View style={styles.overlayLineHorizonal} />
              <View style={styles.overlayRowDirection}>
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState({
                      showWarning: false,
                    });
                  }}>
                  <Text style={styles.overlayTextNormal}>Để sau</Text>
                </TouchableOpacity>
                <View style={styles.overlayLineVertical} />
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={() => {
                    this.setState(
                      {
                        showWarning: false,
                      },
                      () => Actions.login(),
                    );
                  }}>
                  <Text style={styles.overlayText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>
          <Header
            backgroundColor="white"
            containerStyle={{
              borderBottomWidth: 1,
              elevation: 10,
              shadowColor: '#888888',
              marginTop: 0,
            }}
            centerComponent={this.renderCenterHeader()}
          />
          <View style={styles.container}>
            <View style={styles.menu}>
              <View style={styles.menuRow}>
                <View style={styles.menuItem}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({isLoading: true}, () => this.filter())
                    }>
                    <Image
                      style={styles.menuImage}
                      source={require('../global/asset/images/_TaiKhoan.png')}
                    />
                    <Text style={styles.menuTitle}>Sàng lọc{'\n'}nội soi</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.menuItem}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({isLoading: true}, () => this.monitor())
                    }>
                    <Image
                      style={styles.menuImage}
                      source={
                        this.state.activeRegimen
                          ? require('../global/asset/images/_HuongDanUongThuoc.png')
                          : require('../global/asset/images/_HuongDanUongThuoc_Disable.png')
                      }
                    />
                    <Text style={styles.menuTitle}>
                      Bắt đầu{'\n'}uống thuốc
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  choices: state.userInfo.choices,
  filterRegimen: state.filterRegimen,
  regimenInfo: state.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Home);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    ...Platform.select({
      ios: {
        marginTop: 20,
        padding: 10 * screenRate,
      },
      android: {},
      default: {
        marginTop: 20,
        padding: 10 * screenRate,
      },
    }),
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  //menu
  menu: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    marginVertical: moderateScale(20),
  },
  menuItem: {
    borderColor: '#dadce0',
    backgroundColor: 'transparent',
    marginHorizontal: moderateScale(10),
  },
  menuImage: {
    marginTop: moderateScale(-5),
    marginBottom: moderateScale(-5),
    height: moderateScale(90),
    width: moderateScale(90),
  },
  menuTitle: {
    textAlign: 'center',
    color: '#2C7770',
    fontWeight: 'bold',
    backgroundColor: '#fafbff',
    fontSize: moderateScale(16),
    marginBottom: moderateScale(5),
  },
  titleText: {
    fontSize: Math.min(17, 17 * screenRate),
    marginLeft: 10,
    marginRight: 10,
    flex: 0.8,
    ...Platform.select({
      ios: {
        marginTop: -10,
      },
      android: {},
      default: {
        marginTop: -10,
      },
    }),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C7770',
    flexWrap: 'wrap',
  },
  bannerText: {
    fontSize: Math.min(17, 17 * screenRate),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C7770',
  },
  headerRight: {
    paddingTop: Platform.OS === 'ios' ? 64 : 54,
    ...Platform.select({
      ios: {
        height: 64,
        width: 64,
      },
      android: {
        height: moderateScale(70),
        width: moderateScale(70),
      },
      default: {
        height: 64,
        width: 64,
      },
    }),
  },
  headerLeft: {
    paddingTop: Platform.OS === 'ios' ? 64 : 54,
    ...Platform.select({
      ios: {
        height: 64,
        width: 64,
      },
      android: {
        height: moderateScale(70),
        width: moderateScale(70),
      },
      default: {
        height: 64,
        width: 64,
      },
    }),
  },
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
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
});
