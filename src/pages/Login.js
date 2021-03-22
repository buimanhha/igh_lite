import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Button, Input, Overlay} from 'react-native-elements';
import * as StorageUtils from '../global/utils/StorageUtils';
import * as actions from '../redux/actions';
import {connect} from 'react-redux';
import store from '../redux/stores';
import {Thumbnail} from 'native-base';
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

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      activeCode: '',
      validate: '',
      modalVisible: false,
    };
  }

  init = async () => {
    let userInfo = await StorageUtils.getJsonData('userInfo');
    if (
      userInfo != undefined &&
      userInfo != null &&
      Object.keys(userInfo).length > 0
    ) {
      await store.dispatch(actions.storeUser(userInfo));
      Actions.account();
    } else {
      Actions.login();
    }
  };

  closeModal = () => {
    this.setState({modalVisible: false});
  };

  showModal = content => {
    this.setState({modalVisible: true, validate: content});
  };

  signup() {
    Actions.signup();
  }

  login = () => {
    let activeCode = this.state.activeCode;
    if (CommonService.isNullOrEmptyStr(activeCode)) {
      this.showModal('Vui lòng nhập mã số bệnh nhân từ phòng khám !');
    } else {
      if (CommonService.RegexActiveCode.test(activeCode)) {
        this.setState(
          {
            isLoading: true,
          },
          () =>
            this.props.fetchUserDemo({
              extId: this.state.activeCode,
            }),
        );
      } else {
        this.showModal(
          'Mã số bệnh nhân không chính xác. Vui lòng kiểm tra lại !',
        );
      }
    }
  };

  renderRightElement = () => {
    return (
      <View>
        <Button
          onPress={() => {
            Actions.signup();
          }}
          buttonStyle={{backgroundColor: '#F25C5C', marginRight: 5}}
          title="Đăng ký"
        />
      </View>
    );
  };

  async componentDidMount() {
    this.props.navigation.setParams({
      right: this.renderRightElement,
    });
    let userInfo = await StorageUtils.getJsonData('userInfo');
    if (
      userInfo != undefined &&
      userInfo != null &&
      Object.keys(userInfo).length > 0
    ) {
      await store.dispatch(actions.storeUser(userInfo));
      this.setState(
        {
          isLoading: false,
        },
        () => Actions.account(),
      );
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'login') {
      if (
        prevProps.userInfo !== undefined &&
        this.props.userInfo !== undefined &&
        prevProps.userInfo.loading !== undefined &&
        this.props.userInfo.loading !== undefined &&
        this.props.userInfo.error !== undefined &&
        this.props.userInfo.loading !== prevProps.userInfo.loading
      ) {
        let error = this.props.userInfo.error;
        if (error == null || error === undefined || error !== 0) {
          this.setState(
            {
              isLoading: this.props.userInfo.loading,
            },
            () => {
              this.props.userInfo.error = 0;
              this.showModal(
                'Đăng nhập bị lỗi.\nXin vui lòng thử lại hoặc hỏi trợ giúp phòng khám.',
              );
            },
          );
        } else {
          //Luu cache
          await StorageUtils.storeJsonData(
            'userInfo',
            this.props.userInfo.userInfo,
          );
          this.setState(
            {
              isLoading: true,
            },
            () => Actions.root({type: 'reset'}),
          );
        }
      }
    }
  }

  renderRightHeader = () => {
    return (
      <View>
        <TouchableOpacity style={styles.button} onPress={this.signup}>
          <Text style={styles.labelButton}>Đăng ký</Text>
        </TouchableOpacity>
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
        <ImageBackground
          style={styles.background}
          source={require('../global/asset/images/background.jpg')}>
          <View style={styles.container}>
            <View style={{alignItems: 'center'}}>
              <Thumbnail
                large
                source={require('../global/asset/images/account.png')}
              />
            </View>
            <View style={styles.rowInput}>
              <Input
                label="Mã số bệnh nhân"
                labelStyle={styles.labelInput}
                placeholder="Nhập mã số"
                leftIcon={
                  <Icon
                    name="ticket"
                    size={24}
                    color="#2C7770"
                    style={{marginLeft: -10, marginRight: 5, width: 25}}
                  />
                }
                value={this.state.activeCode}
                onChangeText={activeCode => this.setState({activeCode})}
              />
            </View>
            <View style={styles.rowInput}>
              <TouchableOpacity style={styles.button} onPress={this.login}>
                <Text style={styles.labelButton}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Login);

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
    marginLeft: '10%',
    marginRight: '10%',
    marginVertical: 5,
  },
  labelInput: {
    fontSize: 14,
    marginBottom: -10,
    color: '#2C7770',
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
  double: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    height: 45,
    backgroundColor: '#2C7770',
    borderRadius: 10,
    marginVertical: 5,
    paddingVertical: 10,
    marginBottom: 10,
  },
  labelButton: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  link: {
    margin: 5,
    color: '#2C7770',
    textAlign: 'center',
  },
  labelLink: {
    fontSize: 16,
    color: '#2C7770',
    textAlign: 'center',
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
