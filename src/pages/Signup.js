import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Picker,
  ActionSheetIOS,
} from 'react-native';
import {Input, Overlay, Button} from 'react-native-elements';
import moment from 'moment';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as RegimenController from '../controller/RegimenController';
import * as StorageUtils from '../global/utils/StorageUtils';
import * as actions from '../redux/actions';
import {connect} from 'react-redux';
import store from '../redux/stores';
import {Actions} from 'react-native-router-flux';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as CommonService from '../services/CommonService';
import * as Log from '../controller/LogController';

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

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: -1,
      name: '',
      activeCode: '',
      gender: 1,
      birthDay: new Date(),
      year: this.getYear(new Date()),
      validate: '',
      viewDateTimePicker: false,
      modalVisible: false,
      filterVisible: false,
      isLoading: false,
    };
  }

  redirectFilter = async () => {
    let userInfo = this.props.userInfo.userInfo;
    let patientId = userInfo.patient_id;
    let activeCode = userInfo.ext_id;
    if (__DEV__) {
      console.log('redirectFilter = ' + JSON.stringify(userInfo));
    }
    let location = CommonService.getLocationFromCode(activeCode);
    let infoRegimen = {
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
      let response = await RegimenController.createRegimenPatient(infoRegimen);
      let regimenPatientId = response.insertId;
      if (CommonService.isNull(regimenPatientId)) {
        this.setState({filterVisible: false}, () =>
          this.showModal(
            'Lỗi hệ thống.\nXin vui lòng thử lại hoặc liên hệ nhân viên y tế.',
          ),
        );
        return;
      }
      infoRegimen.patient_regimen_id = regimenPatientId;
      await store.dispatch(actions.storeRegimenPatient(infoRegimen));
    } catch (err) {
      this.setState({filterVisible: false}, () =>
        this.showModal('Vui lòng kiểm tra lại kết nối mạng internet.'),
      );
      return;
    }
    this.setState({filterVisible: false}, () => Actions.filter());
  };

  redirectAccount = () => {
    let patientId = this.props.userInfo.patientId;
    this.setState({filterVisible: false}, () =>
      Actions.account({patientId: patientId}),
    );
  };

  closeModal = () => {
    this.setState({modalVisible: false});
  };

  showModal = content => {
    this.setState({modalVisible: true, validate: content});
  };

  getDate = value => {
    return moment(value).format('DD/MM/YYYY');
  };

  getYear = value => {
    return moment(value).format('YYYY');
  };

  showDatePicker = () => {
    this.setState({viewDateTimePicker: true});
  };

  changeDatePicker = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      this.setState({
        viewDateTimePicker: Platform.OS !== 'android',
        birthDay: selectedDate,
      });
    }
  };

  changeGender = value => {
    this.setState({gender: value});
  };

  chooseGender = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Nam', 'Nữ'],
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this.setState({gender: 1});
        } else {
          this.setState({gender: 0});
        }
      },
    );

  create = async () => {
    let name = this.state.name.trim();
    let activeCode = this.state.activeCode.trim();
    let year = Number(this.state.year);
    if (CommonService.isNullOrEmptyStr(name)) {
      this.setState({isLoading: false}, () =>
        this.showModal('Vui lòng điền họ và tên !'),
      );
      return;
    }
    if (CommonService.isNullOrEmptyStr(activeCode)) {
      this.setState({isLoading: false}, () =>
        this.showModal('Vui lòng điền mã số bệnh nhân !'),
      );
      return;
    }
    let location = 0;
    if (CommonService.RegexActiveCode.test(activeCode)) {
      location = CommonService.getLocationFromCode(activeCode);
      if (location < 0) {
        this.setState({isLoading: false}, () =>
          this.showModal('Vui lòng kiểm tra lại mã số bệnh nhân !'),
        );
        return;
      }
    } else {
      this.setState({isLoading: false}, () =>
        this.showModal('Vui lòng điền chính xác mã số bệnh nhân !'),
      );
      return;
    }
    let yearOld = new Date().getFullYear() - Number(year);
    if (yearOld < 18 || yearOld > 60) {
      this.setState({isLoading: false}, () =>
        this.showModal('Vui lòng xác nhận đúng độ tuổi từ 18 đến 60'),
      );
      return;
    }
    await this.props.addUserDemo({
      name: name,
      extId: activeCode.toUpperCase(),
      birthDay: moment(year + '/01/01', 'YYYY/MM/DD').toDate(),
      location: location,
      gender: this.state.gender,
    });
  };

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'signup') {
      if (
        prevProps.userInfo != undefined &&
        this.props.userInfo != undefined &&
        prevProps.userInfo.loading != undefined &&
        this.props.userInfo.loading != undefined &&
        this.props.userInfo.errorCheckUser != undefined &&
        this.props.userInfo.loading !== prevProps.userInfo.loading
      ) {
        if (this.props.userInfo.loading) {
          return;
        }
        let error = this.props.userInfo.errorCheckUser;
        if (error != null && error != undefined) {
          switch (error) {
            case 0:
              let userInfo = this.props.userInfo.userInfo;
              if (userInfo != undefined && userInfo != null) {
                // luu cache
                await StorageUtils.storeJsonData('userInfo', userInfo);
                await store.dispatch(actions.storeUser(userInfo));
                await this.setState({
                  patientId: userInfo.patient_id,
                  isLoading: false,
                  filterVisible: true,
                });
              } else {
                this.setState(
                  {
                    isLoading: false,
                  },
                  () =>
                    this.showModal(
                      'Đăng ký không thành công.\nXin vui lòng thử lại hoặc liên hệ với nhân viên phòng khám.',
                    ),
                );
              }
              return;
            case 1:
              this.setState(
                {
                  isLoading: false,
                },
                () =>
                  this.showModal(
                    'Đăng ký không thành công.\nMã số bệnh nhân đã tồn tại.',
                  ),
              );
              return;
            default:
              this.setState(
                {
                  isLoading: false,
                },
                () =>
                  this.showModal(
                    'Lỗi hệ thống.\nXin vui lòng thử lại hoặc liên hệ với nhân viên phòng khám.',
                  ),
              );
              return;
          }
        }
      }
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loadingForm}>
          <ActivityIndicator size="large" />
          <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
        </View>
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.modalVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Thông báo</Text>
            <Text style={styles.overlayContentText}>{this.state.validate}</Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => {
                  this.setState({modalVisible: false});
                }}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          height="auto"
          isVisible={this.state.filterVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Đăng ký thành công</Text>
            <Text style={styles.overlayContentText}>
              Bạn có muốn làm bộ câu hỏi sàng lọc tiêu chuẩn trước khi nội soi
              đại tràng không ?
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={{flexDirection: 'row', alignContent: 'space-around'}}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => this.redirectAccount()}>
                <Text style={styles.overlayTextNormal}>Từ chối</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => this.redirectFilter()}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <ImageBackground
          style={styles.background}
          source={require('../global/asset/images/background.jpg')}>
          {(Platform.OS == 'android' ||
            (Platform.OS !== 'android' &&
              this.state.viewDateTimePicker == false)) && (
            <ScrollView>
              <View style={styles.rowInput}>
                <Input
                  value={this.state.name}
                  label="Họ và tên"
                  labelStyle={styles.labelInput}
                  placeholder="Nhập họ và tên"
                  leftIcon={
                    <Icon
                      name="user"
                      size={24}
                      color="#2C7770"
                      style={{marginLeft: -10, marginRight: 5, width: 25}}
                    />
                  }
                  style={styles.contentInput}
                  onChangeText={name => this.setState({name})}
                />
              </View>
              <View style={styles.rowInput}>
                <Input
                  value={this.state.activeCode}
                  label="Mã số bệnh nhân"
                  placeholder="Nhập mã số"
                  labelStyle={styles.labelInput}
                  leftIcon={
                    <Icon
                      name="ticket"
                      size={24}
                      color="#2C7770"
                      style={{marginLeft: -10, marginRight: 5, width: 25}}
                    />
                  }
                  style={styles.contentInput}
                  onChangeText={activeCode => this.setState({activeCode})}
                />
              </View>
              <View style={styles.rowDoubleInput}>
                <View style={{padding: 5}}>
                  <Text style={styles.labelInput}>Giới tính</Text>
                  <View style={styles.filedInput}>
                    <Icon
                      style={styles.iconInput}
                      name="transgender"
                      size={29}
                    />
                    {Platform.OS == 'ios' && (
                      <TouchableOpacity onPress={() => this.chooseGender()}>
                        <Text style={styles.labelInput}>
                          {this.state.gender === 1 ? 'Nam' : 'Nữ'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {Platform.OS == 'android' && (
                      <Picker
                        mode="dropdown"
                        style={{width: 100}}
                        itemStyle={{fontSize: 18}}
                        selectedValue={this.state.gender}
                        onValueChange={this.changeGender}>
                        <Picker.Item label="Nam" value="1" />
                        <Picker.Item label="Nữ" value="0" />
                      </Picker>
                    )}
                  </View>
                </View>
                <View style={{padding: 5}}>
                  <View>
                    <Text style={{...styles.labelInput, marginLeft: 20}}>
                      Năm sinh
                    </Text>
                    <View style={styles.filedInput}>
                      <Input
                        editable={true}
                        keyboardType="phone-pad"
                        value={this.state.year}
                        leftIcon={
                          <Icon
                            name="calendar"
                            size={24}
                            color="#2C7770"
                            style={{marginLeft: -10, marginRight: 5}}
                          />
                        }
                        onChangeText={value => this.setState({year: value})}
                        style={styles.contentInput}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.rowInput}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    this.setState({isLoading: true}, () => this.create())
                  }>
                  <Text style={styles.labelButton}>Tạo tài khoản</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          {this.state.viewDateTimePicker && (
            <RNDateTimePicker
              value={this.state.birthDay}
              mode="date"
              onChange={this.changeDatePicker}
            />
          )}
          {this.state.viewDateTimePicker && Platform.OS !== 'android' && (
            <Button
              onPress={() => {
                this.setState({viewDateTimePicker: false});
              }}
              buttonStyle={{backgroundColor: '#03A678'}}
              title="Xong"
            />
          )}
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  rowInput: {
    marginHorizontal: moderateScale(20),
  },
  rowDoubleInput: {
    marginHorizontal: moderateScale(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  labelInput: {
    fontSize: moderateScale(14),
    color: '#2C7770',
    fontWeight: 'bold',
  },
  filedInput: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: 50,
    margin: 5,
  },
  iconInput: {
    width: 30,
    color: '#2C7770',
  },
  contentInput: {
    fontSize: moderateScale(18),
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#2C7770',
  },
  button: {
    backgroundColor: '#2C7770',
    borderRadius: 10,
    marginVertical: 10,
    paddingVertical: 10,
  },
  labelButton: {
    fontSize: moderateScale(18),
    color: '#fff',
    textAlign: 'center',
  },
  titleAlert: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: moderateScale(18),
    textAlign: 'left',
    marginTop: 0,
  },
  contentAlert: {
    marginVertical: 20,
    fontSize: 20,
    textAlign: 'center',
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

const mapStateToProps = state => ({
  patientId: state.patientId,
  userInfo: state.userInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Signup);
