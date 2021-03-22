import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Picker,
  ImageBackground,
  BackHandler,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  ActionSheetIOS,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Input, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import * as StorageUtils from '../../global/utils/StorageUtils';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
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

class Account extends Component {
  constructor(props) {
    super(props);
    this.showDatePicker = this.showDatePicker.bind(this);
    this.state = {
      extId: '',
      name: '',
      birthDay: new Date(),
      year: '',
      gender: 1,
      viewDateTimePicker: false,
      isLoading: true,
      modalVisible: false,
      confirmVisible: false,
    };
  }

  closeModal = () => {
    this.setState({modalVisible: false});
  };

  setModalVisible = (visible, content) => {
    this.setState({modalVisible: visible, validate: content});
  };

  changePwd = () => {
    Actions.changePwd();
  };

  signout = async () => {
    //Close all notify
    NotifyUtils.cancelAll();
    await StorageUtils.clearAll();
    await store.dispatch(actions.clearAllProps());
    await store.dispatch(actions.storeUser({}));
    Actions.login({type: 'reset'});
  };

  getDate = value => {
    return moment(value).format('DD/MM/YYYY');
  };

  getYear = value => {
    return moment(value).format('YYYY');
  };

  showDatePicker() {
    this.setState({viewDateTimePicker: true});
  }

  changeDatePicker = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      this.setState({
        viewDateTimePicker: Platform.OS !== 'android',
        birthDay: selectedDate,
      });
    }
  };

  chooseGender = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Nam', 'Nữ'],
        // destructiveButtonIndex: 2,
        // cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this.setState({gender: 1});
        } else if (buttonIndex === 1) {
          this.setState({gender: 0});
        }
      },
    );

  isChangeProfile = () => {
    return (
      this.state.gender != this.state.oldGender ||
      this.state.birthDay.getTime() !== this.state.oldBirthDay.getTime() ||
      this.state.name != this.state.oldName ||
      this.state.year != this.getYear(this.state.oldBirthDay)
    );
  };

  save = () => {
    let userInfo = this.props.userInfo.userInfo;
    userInfo.gender = this.state.gender;
    userInfo.user_name = this.state.name;
    userInfo.date_of_birth = moment(
      '01-01-' + this.state.year,
      'MM-DD-YYYY',
    ).calendar();
    this.setState({isLoading: true}, () => {
      this.props.updateUser(userInfo);
    });
  };

  handleBackButtonClick() {
    Actions.home({type: 'reset'});
    return true;
  }

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'account') {
      if (
        prevProps.userInfo !== undefined &&
        this.props.userInfo !== undefined &&
        prevProps.userInfo.loading != undefined &&
        this.props.userInfo.loading != undefined &&
        this.props.userInfo.error != undefined &&
        this.props.userInfo.loading !== prevProps.userInfo.loading
      ) {
        let error = this.props.userInfo.error;
        let userInfo = this.props.userInfo.userInfo;
        if (error == 0) {
          this.setState({
            extId: userInfo.ext_id,
            oldName: userInfo.user_name,
            name: userInfo.user_name,
            oldGender: userInfo.gender,
            gender: userInfo.gender,
            oldBirthDay: new Date(userInfo.date_of_birth),
            birthDay: new Date(userInfo.date_of_birth),
            year: this.getYear(new Date(userInfo.date_of_birth)),
            isLoading: this.props.userInfo.loading,
          });
        } else {
          //Reset change
          userInfo.gender = this.state.oldGender;
          userInfo.user_name = this.state.oldName;
          userInfo.date_of_birth = this.state.oldBirthDay;
          this.setState({
            name: userInfo.user_name,
            gender: userInfo.gender,
            birthDay: new Date(userInfo.date_of_birth),
            year: this.getYear(new Date(userInfo.date_of_birth)),
            isLoading: this.props.userInfo.loading,
          });
        }
      }
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  renderRightElement = () => {
    return (
      <View>
        <Button
          onPress={() => {
            this.signout();
          }}
          buttonStyle={{backgroundColor: '#F25C5C', marginRight: 5}}
          title="Đăng xuất"
        />
      </View>
    );
  };

  componentDidMount() {
    this.props.navigation.setParams({
      right: this.renderRightElement,
    });
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    let userInfo = this.props.userInfo.userInfo;
    if (
      userInfo != undefined &&
      userInfo != null &&
      Object.keys(userInfo).length > 0
    ) {
      this.setState({
        isLoading: false,
        extId: userInfo.ext_id,
        oldName: userInfo.user_name,
        name: userInfo.user_name,
        oldGender: userInfo.gender,
        gender: userInfo.gender,
        oldBirthDay: new Date(userInfo.date_of_birth),
        birthDay: new Date(userInfo.date_of_birth),
        year: this.getYear(new Date(userInfo.date_of_birth)),
      });
    }
  }

  render() {
    // console.log('render account|' + JSON.stringify(this.props));
    return this.state.isLoading ? (
      <View style={styles.loadingForm}>
        <ActivityIndicator size="large" />
        <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
      </View>
    ) : (
      <View style={styles.wrapper}>
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
          isVisible={this.state.confirmVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Xác nhận</Text>
            <Text style={styles.overlayContentText}>
              Bạn có chắc chắn thực hiện đăng xuất tài khoản không ?
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => this.setState({confirmVisible: false})}>
                <Text style={styles.overlayTextNormal}>Hủy</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={this.signout}>
                <Text style={styles.overlayText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          {(Platform.OS == 'android' ||
            (Platform.OS !== 'android' &&
              this.state.viewDateTimePicker == false)) && (
            <View style={styles.container}>
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
                      style={{marginLeft: -10, marginRight: 5}}
                    />
                  }
                  style={styles.contentInput}
                  onChangeText={value => this.setState({name: value})}
                />
              </View>
              <View style={styles.rowInput}>
                <Input
                  editable={false}
                  value={this.state.extId}
                  label="Mã bệnh nhân"
                  labelStyle={styles.labelInput}
                  leftIcon={
                    <Icon
                      name="id-card"
                      size={24}
                      color="#2C7770"
                      style={{marginLeft: -10, marginRight: 5}}
                    />
                  }
                  style={styles.contentInput}
                />
              </View>
              <View style={styles.rowDoubleInput}>
                <View>
                  <Text style={styles.labelInput}>Giới tính</Text>
                  <View style={styles.filedInput}>
                    <Icon
                      style={styles.iconInput}
                      name="transgender"
                      size={26}
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
                        mode="dialog"
                        style={{width: 100}}
                        itemStyle={{fontSize: 18}}
                        selectedValue={this.state.gender}
                        onValueChange={value => this.setState({gender: value})}>
                        <Picker.Item label="Nam" value={1} />
                        <Picker.Item label="Nữ" value={0} />
                      </Picker>
                    )}
                  </View>
                </View>
                <View>
                  <Text style={{...styles.labelInput, marginLeft: 20}}>
                    Năm sinh
                  </Text>
                  <View style={styles.filedInput}>
                    <Input
                      containerStyle={{
                        marginRight: 0,
                        width: moderateScale(120),
                        marginRight: -20,
                      }}
                      editable={true}
                      value={this.state.year}
                      keyboardType="phone-pad"
                      leftIcon={
                        <Icon
                          name="calendar"
                          size={24}
                          color="#2C7770"
                          style={{marginLeft: -10, marginRight: 5}}
                        />
                      }
                      onChangeText={value => this.setState({year: value})}
                      style={styles.contentInputYear}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.rowInput}>
                <Button
                  disabled={!this.isChangeProfile()}
                  titleStyle={styles.fontBtn}
                  buttonStyle={styles.warningBtn}
                  disabledStyle={styles.disableBtn}
                  disabledTitleStyle={{color: '#fff'}}
                  title="Cập nhật"
                  onPress={this.save}
                />
              </View>
            </View>
          )}
          {this.state.viewDateTimePicker && (
            <RNDateTimePicker
              testID="dateTimePicker"
              value={this.state.birthDay}
              mode="date"
              is24Hour={true}
              display={Platform.OS !== 'android' ? 'default' : 'spinner'}
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
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Account);

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
    // alignItems: 'center',
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
  rowInput: {
    marginHorizontal: moderateScale(20),
  },
  rowDoubleInput: {
    marginHorizontal: moderateScale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    flex: 1,
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2C7770',
  },
  contentInputYear: {
    paddingRight: 10,
    marginRight: 100,
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2C7770',
  },
  button: {
    backgroundColor: '#2C7770',
    borderRadius: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  labelButton: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  inlineButton: {
    width: moderateScale(120),
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#03A678',
  },
  double: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  rightBtn: {
    backgroundColor: '#03A678',
    borderRadius: 5,
    marginHorizontal: moderateScale(10),
    marginVertical: moderateScale(10),
  },
  groupBtn: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  warningBtn: {
    backgroundColor: '#F25C5C',
    // width: normalWidth(120),
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeBtn: {
    backgroundColor: '#03A678',
    width: normalWidth(120),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  disableBtn: {
    backgroundColor: 'gray',
    color: '#fff',
  },
});
