import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {Input, Overlay} from 'react-native-elements';
import {Picker, Thumbnail} from 'native-base';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import * as StorageUtils from '../../global/utils/StorageUtils';
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

export class ChangePassword extends Component {
  constructor(props) {
    super(props);
    let user = this.props.userInfo.userInfo;
    this.state = {
      patientId: user.patient_id,
      passwd: user.passwd,
      currentPwd: '',
      newPwd: '',
      validatePwd: '',
      validate: '',
      changeVisible: false,
      modalVisible: false,
      isLoading: false,
    };
  }

  showModal = content => {
    this.setState({modalVisible: true, validate: content});
  };

  closeModal = () => {
    this.setState({modalVisible: false});
  };

  retryLogin = async () => {
    //Close all notify
    NotifyUtils.cancelAll();
    await StorageUtils.clearAll();
    await store.dispatch(actions.clearAllProps());
    this.setState(
      {
        changeVisible: false,
      },
      () => Actions.login({onBack: () => Actions.home()}),
    );
  };

  update = () => {
    let passwd = this.state.passwd;
    let currentPwd = this.state.currentPwd;
    let newPwd = this.state.newPwd;
    let validatePwd = this.state.validatePwd;
    if (
      currentPwd !== null &&
      currentPwd !== '' &&
      newPwd !== null &&
      newPwd !== '' &&
      validatePwd !== null &&
      validatePwd !== ''
    ) {
      if (passwd !== currentPwd) {
        this.showModal('Mật khẩu không chính xác');
        return;
      }
      if (newPwd == currentPwd) {
        this.showModal('Mật khẩu mới không thay đổi');
        return;
      }
      if (newPwd != validatePwd) {
        this.showModal('Mật khẩu mới chưa khớp');
        return;
      }
      //Update new password
      var user = this.props.userInfo;
      if (user == null) {
        console('Khong co user info' + JSON.stringify(this.props));
        return;
      }
      //Change password
      user.userInfo.passwd = newPwd;
      this.props.updateUser(user.userInfo);
    } else {
      this.showModal('Vui lòng nhập đủ thông tin !!');
    }
  };

  componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'changePwd') {
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
          this.setState(
            {
              isLoading: false,
            },
            () =>
              this.showModal(
                'Hệ thống lỗi.\nXin vui lòng thử lại hoặc liên hệ với hotline phòng khám.',
              ),
          );
        } else {
          this.setState({
            isLoading: false,
            changeVisible: true,
          });
        }
      }
    }
  }

  render() {
    return this.isLoading ? (
      <View style={styles.loadingForm}>
        <ActivityIndicator size="large" />
        <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
      </View>
    ) : (
      <View style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.validate}
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
                  this.setState({
                    validate: false,
                  });
                }}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          height="auto"
          isVisible={this.state.changeVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>
              Đổi mật khẩu thành công
            </Text>
            <Text style={styles.overlayContentText}>
              Bạn đã thay đổi mật khẩu, vui lòng đăng nhập lại !
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => this.retryLogin()}>
                <Text style={styles.overlayText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          <View style={styles.container}>
            <View style={{alignItems: 'center'}}>
              <Thumbnail
                large
                source={require('../../global/asset/logo/changePwd.jpg')}
              />
            </View>
            <View style={styles.rowInput}>
              <Input
                label="Mật khẩu hiện tại"
                secureTextEntry={true}
                labelStyle={styles.labelInput}
                placeholder="Nhập mật khẩu"
                leftIcon={
                  <Icon
                    name="lock"
                    size={24}
                    color="#2C7770"
                    style={{marginLeft: -10, marginRight: 10}}
                  />
                }
                onChangeText={currentPwd => this.setState({currentPwd})}
              />
            </View>
            <View style={styles.rowInput}>
              <Input
                label="Mật khẩu mới"
                secureTextEntry={true}
                labelStyle={styles.labelInput}
                placeholder="Nhập mật khẩu"
                leftIcon={
                  <Icon
                    name="unlock"
                    size={24}
                    color="#2C7770"
                    style={{marginLeft: -10, marginRight: 5}}
                  />
                }
                onChangeText={newPwd => this.setState({newPwd})}
              />
            </View>
            <View style={styles.rowInput}>
              <Input
                label="Nhập lại mật khẩu mới"
                secureTextEntry={true}
                labelStyle={styles.labelInput}
                placeholder="Nhập mật khẩu"
                leftIcon={
                  <Icon
                    name="unlock"
                    size={24}
                    color="#2C7770"
                    style={{marginLeft: -10, marginRight: 5}}
                  />
                }
                onChangeText={validatePwd => this.setState({validatePwd})}
              />
            </View>
            <View style={styles.rowInput}>
              <TouchableOpacity style={styles.button} onPress={this.update}>
                <Text style={styles.labelButton}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
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
)(ChangePassword);

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
    marginLeft: '10%',
    marginRight: '10%',
    marginVertical: 5,
  },
  rowDoubleInput: {
    marginLeft: '10%',
    marginRight: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelInput: {
    fontSize: 14,
    marginBottom: -10,
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
