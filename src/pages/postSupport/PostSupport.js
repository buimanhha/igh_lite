import React, {Component, useState, useEffect} from 'react';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as Constants from '../../global/constants';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import * as PatientController from '../../controller/PatientController';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {Divider} from 'react-native-elements';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import {Card, Button, Icon, Overlay} from 'react-native-elements';
import {Actions} from 'react-native-router-flux';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

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

class PostSupport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resultDate: null,
      reExaminationDate: null,
      isGetResult: false,
      isReExamination: false,
      isloading: true,
      showDate: false,
      showOverlay: false,
      showRemind: false,
      contentOverlay: '',
    };
  }

  showDate = content => {
    this.setState({
      showDate: true,
    });
  };

  closeDate = () => {
    let needReExamation = this.state.needReExamation;
    if (
      needReExamation == null ||
      needReExamation == undefined ||
      !needReExamation
    ) {
      this.setState({
        showDate: false,
        showRemind: !this.state.isReExamination,
      });
    } else {
      this.setState({
        showDate: false,
        showRemind: true,
      });
    }
  };

  showNotice = content => {
    this.setState({
      showOverlay: true,
      contentOverlay: content,
    });
  };

  viewPost = () => {
    Actions.guidePostSupport();
  };

  viewRemind = () => {
    this.setState({showRemind: false}, () => {
      Actions.viewCalendar({
        viewtype: 're-examination',
        title: 'Lịch tái khám',
        selectedDate: null,
        valueDate: moment(new Date()).format('DD-MM-YYYY'),
        strDate: moment(new Date()).format('YYYY-MM-DD'),
      });
    });
  };

  viewCalendar = () => {
    let reExaminationDate = this.state.reExaminationDate;
    if (
      reExaminationDate == null ||
      reExaminationDate == undefined ||
      reExaminationDate < 0
    ) {
      this.setState({
        showRemind: true,
      });
    } else {
      Actions.viewCalendar({
        viewtype: 're-examination',
        title: 'Lịch tái khám',
        selectedDate: moment(reExaminationDate),
        valueDate: moment(reExaminationDate).format('DD-MM-YYYY'),
        strDate: moment(reExaminationDate).format('YYYY-MM-DD'),
      });
    }
  };

  viewResult = () => {
    let resultDate = this.state.resultDate;
    if (resultDate == null || resultDate == undefined) {
      this.showNotice('Bạn không cần lấy kết quả sinh thiết');
    } else {
      Actions.viewCalendar({
        viewtype: 'result',
        title: 'Lịch lấy kết quả sinh thiết',
        selectedDate: moment(resultDate),
        valueDate: moment(resultDate).format('DD-MM-YYYY'),
        strDate: moment(resultDate).format('YYYY-MM-DD'),
      });
    }
  };

  componentDidMount() {
    let userInfo = this.props.userInfo;
    if (userInfo != null && userInfo != undefined) {
      let choices = JSON.parse(userInfo.data_content).choices;
      let resultDate = choices.resultDate;
      let reExaminationDate = choices.reExaminationDate;
      let isGetResult =
        resultDate !== undefined &&
        resultDate != null &&
        moment().isBefore(moment(resultDate));
      let isReExamination =
        reExaminationDate !== undefined &&
        reExaminationDate != null &&
        moment().isBefore(moment(reExaminationDate));
      this.setState(
        {
          isLoading: false,
          isGetResult: isGetResult,
          isReExamination: isReExamination,
          resultDate: resultDate,
          reExaminationDate: reExaminationDate,
        },
        () => this.showDate(),
      );
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
    return (
      <View style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.showOverlay}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
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
        <Overlay
          height="auto"
          isVisible={this.state.showDate}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Nhắc lịch</Text>
            <Text style={styles.dateNoticeText}>
              Bạn có lịch đăng ký cần chú ý như sau:
            </Text>
            {this.state.isGetResult && (
              <View>
                <Text style={styles.dateNoticeText}>
                  Ngày lấy kết quả sinh thiết:
                </Text>
                <Text style={styles.dateText}>
                  {moment(this.state.resultDate).format('DD-MM-YYYY')}
                </Text>
                <View style={styles.overlayLineHorizonal} />
              </View>
            )}
            {this.state.isReExamination && (
              <View>
                <Text style={styles.dateNoticeText}>Ngày tái khám:</Text>
                <Text style={styles.dateText}>
                  {moment(this.state.reExaminationDate).format('DD-MM-YYYY')}
                </Text>
                <View style={styles.overlayLineHorizonal} />
              </View>
            )}
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => {
                  this.closeDate();
                }}>
                <Text style={styles.overlayText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <Overlay
          isVisible={this.state.showRemind}
          height="auto"
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0, width: '90%'}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Thông báo</Text>
            <Text style={styles.overlayContentText}>
              Bạn có dự định tái khám vào ngày nào ?
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={{flexDirection: 'row', alignContent: 'space-around'}}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => {
                  this.setState({showRemind: false});
                }}>
                <Text style={styles.overlayTextNormal}>Không</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={this.viewRemind}>
                <Text style={styles.overlayText}>Có</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          <View style={styles.container}>
            <Card
              title="CHỨC NĂNG HỖ TRỢ"
              titleStyle={{fontSize: moderateScale(18)}}
              containerStyle={{borderRadius: 10}}>
              <Button
                onPress={this.viewPost}
                icon={
                  <Icon
                    name="search"
                    type="font-awesome"
                    color="#ffffff"
                    size={moderateScale(20)}
                  />
                }
                buttonStyle={{
                  marginVertical: moderateScale(5),
                  backgroundColor: '#03A678',
                }}
                title="Bài viết hướng dẫn"
                titleStyle={{
                  padding: 5,
                  fontSize: moderateScale(18),
                  color: 'white',
                }}
              />
              <Button
                onPress={this.viewCalendar}
                icon={
                  <Icon name="calendar" type="font-awesome" color="#ffffff" />
                }
                buttonStyle={{
                  marginVertical: moderateScale(5),
                  backgroundColor: '#F25C5C',
                }}
                title="Nhắc lịch tái khám"
                titleStyle={{
                  marginLeft: moderateScale(10),
                  fontSize: moderateScale(18),
                }}
              />
              {this.state.isGetResult && (
                <Button
                  onPress={this.viewResult}
                  icon={
                    <Icon name="calendar" type="font-awesome" color="#ffffff" />
                  }
                  buttonStyle={{
                    marginVertical: moderateScale(5),
                    backgroundColor: '#F25C5C',
                  }}
                  title="Nhắc lịch lấy sinh thiết"
                  titleStyle={{
                    marginLeft: moderateScale(10),
                    fontSize: moderateScale(18),
                  }}
                />
              )}
            </Card>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  regimenInfo: state.regimenInfo.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
  endoscopicInfo: state.endoscopicInfo.endoscopicInfo,
  userInfo: state.userInfo.userInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(PostSupport);

export const headerBasic = {
  fontSize: 24,
  color: '#2C7770',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
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
  //time
  dateNoticeText: {
    textAlign: 'left',
    fontSize: moderateScale(18),
  },
  dateText: {
    textAlign: 'center',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
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
