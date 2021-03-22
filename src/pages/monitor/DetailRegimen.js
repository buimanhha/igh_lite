/* eslint-disable no-undef */
import React, {Component, useState, useEffect} from 'react';
import {Colors, Typography, Spacing} from '../../global/styles/index';
import * as StorageUtils from '../../global/utils/StorageUtils';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as PatientController from '../../controller/PatientController';
import * as Constants from '../../global/constants';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Button, Overlay} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {ScrollView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
// import {
//   BottomSheetBehavior,
//   CoordinatorLayout,
//   FloatingActionButton,
// } from 'react-native-bottom-sheet-behavior';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Timeline from 'react-native-timeline-flatlist';
// import SwipeablePanel from 'rn-swipeable-panel';
import overlayStyle from '../../global/asset/css/overlayStyle';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

const deviceW = Dimensions.get('window').width;
const deviceH = Dimensions.get('window').height;
const screenRate = deviceW / 430;
const itemH = deviceH * 0.15;
let noticeBeforeContent = [];
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

class DetailRegimen extends Component {
  constructor(props) {
    super(props);
    let regimentPatient = this.props.regimenPatientInfo;
    //fetch to new data
    let regimentId = regimentPatient.regimen_id;
    let atClinic = regimentPatient.regimen_where;
    this.props.fetchRegimen(regimentId);
    this.state = {
      atClinic: atClinic == 'clinic',
      isLoading: true,
      readPolicy: false,
      noticeVisible: false,
      bottomPanelVisible: false,
      beforeNoticeVisible: false,
      modalVisible: false,
      data: [],
      noticeContent: '',
      noticeBeforeIndex: 0,
    };
  }

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#2C7770',
        }}
      />
    );
  };

  getTimeString = value => {
    let datetime = new Date(value);
    let time =
      moment(datetime).format('HH') +
      ' giờ ' +
      moment(datetime).format('mm') +
      ' phút, ';
    let date = moment(datetime).format('ngày DD/MM/YYYY');
    return time + date;
  };

  showNotice = content => {
    this.setState({
      noticeVisible: true,
      noticeContent: content,
    });
  };

  showBeforeNotice = () => {
    this.setState({beforeNoticeVisible: true, noticeBeforeIndex: 0});
  };

  start = () => {
    //validate start time begin
    let patientRegimenInfo = this.props.regimenPatientInfo;
    // console.log('patientRegimenInfo.eff_date:' + patientRegimenInfo.eff_date);
    if (
      new Date().getTime() < new Date(patientRegimenInfo.eff_date).getTime()
    ) {
      this.showNotice(
        'Vui lòng chờ đến ' +
          this.getTimeString(patientRegimenInfo.eff_date) +
          ' để bắt đầu uống thuốc. Hệ thống sẽ thông báo cho bạn khi thời gian tới.',
      );
      return;
    }
    //end
    //habm update req 56
    this.setState({modalVisible: true});
  };

  cancel = () => {
    this.setState({modalVisible: false});
  };

  accept = async () => {
    let regimenPatient = this.props.regimenPatientInfo;
    //update start time of first step
    let step_timing = regimenPatient.step_timing;
    let jsonStepTiming = [];
    if (step_timing != null && step_timing != undefined && step_timing != '') {
      jsonStepTiming = JSON.parse(step_timing);
    }
    jsonStepTiming[0] = {
      ...jsonStepTiming[0],
      start_time: new Date().getTime(),
    };
    regimenPatient.start_time = new Date();
    regimenPatient.step_timing = JSON.stringify(jsonStepTiming);
    regimenPatient.state = Constants.PATIENT_STATE_ACTIVE;

    // var response = await PatientController.updateRegimenPatient(
    //   regimenPatient.patient_id,
    //   regimenPatient,
    // );
    var response = await PatientController.updateRegimenPatientFields_2(
      regimenPatient.patient_regimen_id,
      {
        start_time: regimenPatient.start_time,
        // exp_date:regimenPatient.exp_date,
        // eff_date:regimenPatient.eff_date,
        state: regimenPatient.state,
        // regimen_where:regimenPatient.regimen_where,
        step_timing: regimenPatient.step_timing,
      },
    );

    //done check response
    if (response == null) {
      this.showNotice(
        'Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này',
      );
      return;
    }

    var jsonResponse = await response.json();
    if (
      jsonResponse != null &&
      jsonResponse != undefined &&
      jsonResponse.affectedRows > 0
    ) {
      //sync to redux
      store.dispatch(actions.storeRegimenPatient(regimenPatient));
      //save to storage if query success
      await StorageUtils.storeJsonData('regimenPatientInfo', regimenPatient);
      // this.setState({modalVisible: false});
      Actions.activeRegimen();
    } else {
      // this.setState({modalVisible: false});
      this.showNotice(
        'Lỗi!!! Xin vui lòng đảm bảo kết nối internet cho thao tác này',
      );
      return;
    }

    // this.props.dbUpdateRegimenPatient(patientRegimenInfo);
  };

  componentDidMount() {
    noticeBeforeContent[0] = (
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
            <Icon name="check" style={styles.iconInText} /> Trong 2-3 ngày trước
            ngày nội soi, không ăn các loại hoa quả có hạt như dưa hấu, cà chua,
            nho, dưa chuột, thanh long hoặc các loại hạt như hạnh nhân, lạc, hạt
            dẻ, …
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
            onPress={() => this.setState({beforeNoticeVisible: false})}>
            <Text style={overlayStyle.overlayTextNormal}>Hủy</Text>
          </TouchableOpacity>
          <View style={overlayStyle.overlayLineVertical} />
          <TouchableOpacity
            style={overlayStyle.overlayButton}
            onPress={() => {
              this.setState({noticeBeforeIndex: 1});
            }}>
            <Text style={overlayStyle.overlayText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
    noticeBeforeContent[1] = (
      <View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
          <Text style={overlayStyle.overlayContentText}>
            <Icon name="check" style={styles.iconInText} /> Vào trước ngày dự
            soi, ngừng uống các thuốc có chất sắt
            {'\n'}
            <Icon name="check" style={styles.iconInText} /> Không ăn các thực
            phẩm cứng, khó tiêu.{'\n'}
            <Icon name="check" style={styles.iconInText} /> Nên ăn chế độ không
            có chất xơ và rau. Buổi tối nên ăn cơm nát hoặc cháo (không ăn cháo
            các loại hạt, các loại đỗ, cháo có hành).{'\n'}
            <Icon name="check" style={styles.iconInText} /> Tránh các nước có
            màu, không nước café, sữa, yogurt, rượu hay socola.
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
          <TouchableOpacity
            style={overlayStyle.overlayButton}
            onPress={() => {
              this.setState({noticeBeforeIndex: 0});
            }}>
            <Text style={overlayStyle.overlayTextNormal}>Quay lại</Text>
          </TouchableOpacity>
          <View style={overlayStyle.overlayLineVertical} />
          <TouchableOpacity
            style={overlayStyle.overlayButton}
            onPress={() => {
              this.setState({beforeNoticeVisible: false});
            }}>
            <Text style={overlayStyle.overlayText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  componentDidUpdate(prevProps) {
    if (Actions.currentScene === 'DetailRegimen') {
      if (
        prevProps.regimenInfo == undefined ||
        (this.props.regimenInfo !== undefined &&
          prevProps.regimenInfo !== undefined &&
          this.props.regimenInfo.loading !== prevProps.regimenInfo.loading)
      ) {
        this.refreshScreen();
      }
    }
  }

  refreshScreen = () => {
    let timeLineData = [];
    let regimenInfo = this.props.regimenInfo.regimenInfo;
    if (
      regimenInfo !== undefined &&
      regimenInfo !== null &&
      regimenInfo.regimensteps !== undefined &&
      regimenInfo.regimensteps != null
    ) {
      regimenInfo.regimensteps.forEach((item, index) => {
        timeLineData[index] = {
          time: item.time,
          title: item.name,
          description: item.note,
          circleColor: '#009688',
          lineColor: '#009688',
        };
      });
    }
    this.setState({
      isLoading: this.props.regimenInfo.loading,
      data: timeLineData,
    });
  };

  openPanel = () => {
    this.setState({bottomPanelVisible: true});
  };

  closePanel = () => {
    this.setState({bottomPanelVisible: false});
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
            // ios: {lineHeight: fontSize * 2, paddingTop: 5},
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
          }),
        }}>
        {number}
      </Text>
    );
  };

  renderItem = ({item, index}) => (
    <LinearGradient
      colors={[
        Colors.gradientColor[index].from,
        Colors.gradientColor[index].to,
      ]}
      start={{x: 1, y: 0}}
      end={{x: 0, y: 0}}>
      <View
        key={index}
        style={{
          height: itemH,
          flexDirection: 'row',
          marginHorizontal: 10 * screenRate,
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
            backgroundColor: Colors.gradientColor[index].other,
          }}>
          {this.numberIcon(index + 1, '#000000', 24 * screenRate)}
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-evenly',
          }}>
          <Text
            style={{
              flexWrap: 'wrap',
              fontSize: 20 * screenRate,
              marginLeft: 10 * screenRate,
            }}>
            {item.title}
          </Text>
          <Text
            style={{
              flexWrap: 'wrap',
              fontSize: 20 * screenRate,
              marginLeft: 10 * screenRate,
            }}>
            Thời gian:{' '}
            {<Text style={{fontWeight: 'bold'}}>{item.time} phút</Text>}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  render() {
    let regimenInfo = this.props.regimenInfo.regimenInfo;
    return this.state.isLoading ? (
      <View style={styles.loadingForm}>
        <ActivityIndicator size="large" />
        <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
      </View>
    ) : regimenInfo == undefined ||
      regimenInfo == null ||
      regimenInfo.regimensteps == null ||
      regimenInfo.regimensteps == undefined ? (
      <View style={styles.errorForm}>
        <Image
          style={styles.errorIcon}
          source={require('../../global/asset/icon/notFound.png')}
        />
        <Text style={styles.errorTitle}>Đang cập nhật nội dung</Text>
      </View>
    ) : (
      <View style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.noticeVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{
            elevation: 0,
            shadowOpacity: 0,
            width: moderateScale(300),
          }}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Thông báo</Text>
            <Text style={styles.overlayContentText}>
              {this.state.noticeContent}
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => {
                  this.setState({
                    noticeVisible: false,
                  });
                }}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          isVisible={this.state.modalVisible}
          height="auto"
          width={0.95 * deviceW}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            {/* <Icon5.Button
              name="notes-medical"
              size={30}
              color="#900"
              solid
              style={{alignSelf: 'center'}}
              backgroundColor="#ffffff"> */}
            <Text style={styles.overlayHeaderText}>LƯU Ý</Text>
            {/* </Icon5.Button> */}
            <Text style={styles.overlayContentText}>
              {regimenInfo.before}{' '}
              <Image
                style={styles.imageInline}
                source={require('../../global/asset/images/SOS.png')}
              />
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  this.setState({
                    bottomPanelVisible: false,
                    modalVisible: false,
                  });
                }}>
                <Text style={styles.overlayTextNormal}>Hủy</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={async () => {
                  this.setState({
                    modalVisible: false,
                    bottomPanelVisible: true,
                  });
                }}>
                <Text style={styles.overlayText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          isVisible={this.state.bottomPanelVisible}
          height="auto"
          width={0.95 * deviceW}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <ScrollView style={styles.overlayContainer}>
            {/* <Icon5.Button
              name="notes-medical"
              size={30}
              color="#900"
              solid
              style={{alignSelf: 'center'}}
              backgroundColor="#ffffff"> */}
            <Text style={styles.overlayHeaderText}>LƯU Ý</Text>
            {/* </Icon5.Button> */}
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={styles.overlayContentText}>
                {regimenInfo.during}
              </Text>
            </View>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  this.setState({
                    bottomPanelVisible: false,
                    modalVisible: true,
                  });
                }}>
                <Text style={styles.overlayTextNormal}>Quay lại</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  this.setState(
                    {
                      bottomPanelVisible: false,
                      modalVisible: false,
                    },
                    () => this.accept(),
                  );
                }}>
                <Text style={styles.overlayText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Overlay>
        <Overlay
          height="auto"
          isVisible={this.state.beforeNoticeVisible}
          overlayBackgroundColor="transparent"
          overlayStyle={{
            elevation: 0,
            shadowOpacity: 0,
            width: moderateScale(300),
          }}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <View
              style={{
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon5.Button
                name="notes-medical"
                size={30}
                color="#900"
                solid
                backgroundColor="#ffffff">
                <Text style={overlayStyle.overlayHeaderText}>LƯU Ý</Text>
              </Icon5.Button>
            </View>
            {noticeBeforeContent[this.state.noticeBeforeIndex]}
          </View>
        </Overlay>
        <View style={styles.container}>
          <Text
            style={{
              paddingTop: 10 * screenRate,
              textAlign: 'center',
              color: '#000000',
              fontSize: 20 * screenRate,
              fontWeight: 'normal',
              marginLeft: 10 * screenRate,
            }}>
            CÁC BƯỚC
          </Text>
          <Text
            style={{
              paddingTop: 10 * screenRate,
              textAlign: 'center',
              color: '#000000',
              fontSize: 20 * screenRate,
              fontWeight: 'bold',
              marginLeft: 10 * screenRate,
              marginBottom: 20 * screenRate,
            }}>
            LÀM SẠCH ĐẠI TRÀNG
          </Text>
          {/* <View
            style={{
              backgroundColor: '#F2CD5C',
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 10,
            }}>
            <Text style={styles.titlePage}>
              Chi tiết các bước hướng dẫn uống thuốc chuẩn bị cho việc nội soi
              tại phòng khám.
            </Text>
          </View>
          <Hr
            textStyles={styles.titleText}
            lineColor="#2C7770"
            text="Các bước chuẩn bị"
          /> */}
          {/* <Timeline
            style={styles.list}
            data={this.state.data}
            circleSize={20}
            separator={true}
            circleColor="rgb(45,156,219)"
            lineColor="rgb(45,156,219)"
            timeContainerStyle={{minWidth: 10, marginTop: 0}}
            timeStyle={{
              textAlign: 'center',
              backgroundColor: '#009688',
              color: 'white',
              padding: 5,
              borderRadius: 10,
            }}
            descriptionStyle={{color: 'gray', fontSize: 14}}
            options={{
              style: {paddingTop: 5},
            }}
            innerCircle={'dot'}
          /> */}
          <FlatList
            keyExtractor={this.keyExtractor}
            data={this.state.data}
            renderItem={this.renderItem}
          />
          <View style={styles.groupBtn}>
            {this.props.regimenPatientInfo.state ==
              Constants.PATIENT_STATE_READY_ACTIVE && (
              <Button
                onPress={() => this.start()}
                buttonStyle={{
                  alignSelf: 'center',
                  backgroundColor: '#03A678',
                  width: 200,
                  borderRadius: 5,
                  marginVertical: 5,
                }}
                icon={
                  <Icon
                    name="hourglass-start"
                    color="#ffffff"
                    size={18}
                    style={{marginRight: 5}}
                  />
                }
                title="Bắt đầu uống thuốc"
                titleStyle={{fontSize: 16}}
              />
            )}
            {!this.state.atClinic && (
              <Button
                onPress={() => this.showBeforeNotice()}
                buttonStyle={{
                  alignSelf: 'center',
                  backgroundColor: '#F25C5C',
                  width: 100,
                  borderRadius: 5,
                  marginVertical: 5,
                }}
                icon={
                  <Icon
                    name="comment"
                    color="#ffffff"
                    size={18}
                    style={{marginRight: 5}}
                  />
                }
                title="Lưu ý"
                titleStyle={{fontSize: 16}}
              />
            )}
          </View>
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
              <Text style={styles.titleText}>
                Lưu ý trong quá trình uống thuốc
              </Text>
              <Text style={styles.noticeContent}>
                {this.state.atClinic ? regimenInfo.note : regimenInfo.during}
              </Text>
              <Button
                onPress={() => this.accept()}
                buttonStyle={{
                  backgroundColor: '#2C7770',
                  width: 150,
                  alignSelf: 'center',
                  marginVertical: 5,
                }}
                icon={{name: 'check', color: 'white'}}
                title="Đồng ý"
              />
            </View>
          </SwipeablePanel> */}
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  filterRegimen: state.filterRegimen,
  regimenInfo: state.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(DetailRegimen);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
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
    textAlign: 'justify',
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
  errorIcon: {
    height: 90 * screenRate,
    width: 90 * screenRate,
    alignSelf: 'center',
  },
  warningIcon: {
    height: 60 * screenRate,
    width: 60 * screenRate,
    alignSelf: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18 * screenRate,
    marginVertical: 10 * screenRate,
    color: '#2C7770',
  },
  titleText: {
    textAlign: 'center',
    color: '#2C7770',
    fontSize: 18 * screenRate,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  list: {
    // flex: 1,
    marginHorizontal: 10 * screenRate,
  },
  label: {
    fontSize: 18 * screenRate,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
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
  //style for overlay
  overlay: {
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'left',
    alignSelf: 'center',
    fontSize: moderateScale(16),
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
  imageInline: {
    width: 20 * screenRate,
    height: 20 * screenRate,
  },
  groupBtn: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
