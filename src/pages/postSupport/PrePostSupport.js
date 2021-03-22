import React, {Component, useState, useEffect} from 'react';
import {Colors, Typography, Spacing} from '../../global/styles/index';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as Constants from '../../global/constants';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import * as PatientController from '../../controller/PatientController';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
// import CheckBox from '@react-native-community/checkbox';
import {Button, CheckBox, Overlay} from 'react-native-elements';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {transparent} from '../../global/styles/colors';
import {ScrollView} from 'react-native-gesture-handler';
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

class PrePostSupport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      noticeVisible: false,
      confirmVisible: false,
      contentOverlay: '',
      step: 3,
      endoscopic: [],
      surgery: [],
      names: [],
      tags: '',
    };
  }

  showNotice = content => {
    this.setState({
      noticeVisible: true,
      contentOverlay: content,
    });
  };

  showConfirm = () => {
    this.setState({
      confirmVisible: true,
    });
  };

  setDate = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      if (selectedDate.getHours() >= 7) {
        selectedDate = moment(selectedDate)
          .add(1, 'days')
          .toDate();
      }
      selectedDate.setHours(7, 0, 0, 0);
      this.setState({show: false, date: selectedDate});
    }
  };

  changeEndoscopic = index => {
    let surgery = this.state.surgery;
    surgery[index] = !surgery[index];
    this.setState({
      surgery: surgery,
    });
  };

  confirm = () => {
    let tags = '';
    let names = [];
    let isChoose = false;
    let question = this.state.surgery;
    let endoscopic = this.state.endoscopic;
    question.forEach((element, index) => {
      isChoose = isChoose || element;
      if (element) {
        let id = names.length;
        names[id] = endoscopic[index].name;
        tags += endoscopic[index].tags + ', ';
      }
    });
    if (!isChoose) {
      this.showNotice('Vui lòng xác nhận các thủ thuật của bạn');
      return;
    }
    if (tags.length > 1) {
      tags = tags.substring(1);
    }
    this.setState(
      {
        tags: tags,
        names: names,
      },
      () => this.showConfirm(),
    );
  };

  getResultDate = () => {
    let reminder = moment()
      .add(6, 'days')
      .toDate();
    reminder.setHours(8);
    reminder.setMinutes(0);
    reminder.setSeconds(0);
    reminder.setMilliseconds(0);
    let date = moment()
      .add(7, 'days')
      .toDate();
    let subContent = 'Lịch lấy kết quả phòng khám Hoàng Long';
    let title = 'Phòng khám Hoàng Long';
    let sticker = 'Nhắc lịch';
    let mainContent =
      'Còn 01 ngày nữa sẽ đến lịch lấy kết quả sinh thiết. Vui lòng đến lấy kết quả vào ngày ' +
      moment(date).format('DD/MM/YYYY');
    NotifyUtils.sendSchedule(reminder, mainContent, subContent, sticker, title);
    return date;
  };

  saveEndoscopic = async () => {
    let question = this.state.surgery;
    let isGetResult = false;
    let isReExamination = false;
    this.state.endoscopic.forEach((element, index) => {
      if (element.biopsy > 0 && question[index]) {
        isGetResult = true;
      }
      if (element['re-examination'] > 0 && question[index]) {
        isReExamination = true;
      }
    });
    let resultDate = isGetResult ? this.getResultDate() : '';
    let reExaminationDate = isReExamination ? -1 : '';
    let dataContentJson = {};
    let userInfo = this.props.userInfo.userInfo;
    let dataContent = userInfo.data_content;
    if (
      dataContent != null &&
      dataContent != undefined &&
      dataContent != '' &&
      Object.keys(dataContent).length > 0
    ) {
      dataContentJson = JSON.parse(dataContent);
    }
    dataContentJson.choices = {
      surgery: this.state.surgery,
      tags: this.state.tags,
      reExaminationDate: reExaminationDate,
      resultDate: resultDate,
    };
    userInfo.data_content = JSON.stringify(dataContentJson);
    this.props.updateUser(userInfo);
    this.setState({confirmVisible: false}, () => {
      Actions.postSupport();
    });
  };

  separatorFlatlist = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#dedfe0',
        }}
      />
    );
  };

  headerFlatlist = () => {
    return (
      <View style={styles.headerFlatlist}>
        <View style={{flex: 3}}>
          <Text style={styles.itemLabel}>Tên thủ thuật</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.checkboxLabel}>Có</Text>
        </View>
      </View>
    );
  };

  componentDidMount() {
    this.props.fetchEndoscopicProcedure();
  }

  componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'prePostSupport') {
      if (
        this.props.endoscopicInfo !== undefined &&
        prevProps.endoscopicInfo !== undefined &&
        this.props.endoscopicInfo.loading != undefined &&
        prevProps.endoscopicInfo.loading != undefined &&
        this.props.endoscopicInfo.error != undefined &&
        this.props.endoscopicInfo.loading !== prevProps.endoscopicInfo.loading
      ) {
        let surgery = [];
        let endoscopic = this.props.endoscopicInfo.endoscopicInfo;
        if (endoscopic == null || endoscopic == undefined) {
          // this.setState({
          //   isLoading: false,
          // });
          // console.log('====================');
        } else {
          for (let index = 0; index < endoscopic.length; index++) {
            surgery[index] = false;
          }
          this.setState({
            isLoading: false,
            endoscopic: endoscopic,
            surgery: surgery,
          });
        }
      }
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
          isVisible={this.state.noticeVisible}
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
                  this.setState({noticeVisible: false});
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
              Danh sách các thủ thuật mà bạn đã được áp dụng là:
              {'\n'}
              {this.state.names.map((element, i) => (
                <Text style={styles.nameEndoscopic}>
                  - {element}
                  {'\n'}
                </Text>
              ))}
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
                onPress={this.saveEndoscopic}>
                <Text style={styles.overlayText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <View>
          {this.state.endoscopic == undefined ||
          this.state.endoscopic == null ||
          this.state.endoscopic.length == 0 ? (
            <View style={styles.errorForm}>
              <Image
                style={styles.errorIcon}
                source={require('../../global/asset/icon/notFound.png')}
              />
              <Text style={styles.errorTitle}>Đang cập nhật nội dung</Text>
            </View>
          ) : (
            <View>
              <View style={styles.titleForm}>
                <Text style={styles.titleText}>
                  Ngày hôm nay, bạn đã tiến hành các thủ thuật nào ?
                </Text>
              </View>
              <FlatList
                data={this.state.endoscopic}
                ItemSeparatorComponent={this.separatorFlatlist}
                ListHeaderComponent={this.headerFlatlist}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: index % 2 !== 0 ? '#fff' : '#F2F2F2',
                    }}>
                    <View style={{flex: 3}}>
                      <Text style={styles.subQuestionTitle}>
                        {index + 1}. {item.name}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <CheckBox
                        center
                        size={moderateScale(18)}
                        checkedIcon="check"
                        uncheckedIcon="circle-o"
                        checkedColor="#2089dc"
                        textStyle={styles.checkboxLabel}
                        containerStyle={styles.checkboxContent}
                        checked={
                          this.state.surgery[index] === undefined
                            ? false
                            : this.state.surgery[index]
                        }
                        onPress={() => this.changeEndoscopic(index)}
                      />
                    </View>
                  </View>
                )}
              />
              <View style={{justifyContent: 'center'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Button
                    icon={
                      <Icon
                        name="check"
                        color="#ffffff"
                        size={moderateScale(18)}
                        style={{marginRight: moderateScale(5)}}
                      />
                    }
                    buttonStyle={{
                      backgroundColor: '#03A678',
                      width: moderateScale(125),
                      borderRadius: 5,
                    }}
                    title="Xác nhận"
                    titleStyle={{fontSize: moderateScale(16)}}
                    onPress={this.confirm}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  regimenInfo: state.regimenInfo.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
  endoscopicInfo: state.endoscopicInfo,
  userInfo: state.userInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(PrePostSupport);

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
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
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
  //title
  titleForm: {
    backgroundColor: '#F2CD5C',
  },
  titleText: {
    textAlign: 'justify',
    fontSize: moderateScale(18),
    marginHorizontal: moderateScale(10),
  },
  nameEndoscopic: {
    // fontWeight: 'bold',
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
  cardForm: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  questionTitle: {
    fontSize: 16,
    color: '#2C7770',
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  itemLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    paddingLeft: 10,
    marginVertical: 5,
  },
  wrapperColumn: {
    flexDirection: 'column',
    width: '80%',
  },
  Time: {
    // flexGrow: 1,
    fontSize: 25,
    color: 'red',
    // padding: 5,
    padding: 10,
    margin: 10,
    flex: 1,
    textAlign: 'center',
    backgroundColor: Colors.sectionBackground,
  },
  header1: {
    ...headerBasic,
    flex: 0.5,
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 50,
    margin: 5,
  },
  inputBox: {
    flex: 1,
    fontSize: 18,
  },
  iconBox: {
    marginRight: 5,
    color: '#2C7770',
  },
  note: {
    ...headerBasic,
    fontWeight: 'normal',
  },
  button: {
    width: 150,
    backgroundColor: '#2C7770',
    borderRadius: 15,
    alignSelf: 'center',
    marginVertical: 5,
  },
  buttonDisable: {
    width: '40%',
    backgroundColor: Colors.darkGray,
    borderRadius: 25,
    paddingVertical: 12,
    marginLeft: '8%',
    marginRight: '8%',
    height: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    padding: 10,
  },
  errorForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    height: 90,
    width: 90,
    alignSelf: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    marginVertical: moderateScale(10),
    color: '#2C7770',
  },
  headerFlatlist: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  //question
  questionForm: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: moderateScale(5),
    marginLeft: moderateScale(10),
    marginRight: moderateScale(10),
  },
  mainQuestionTitle: {
    marginVertical: moderateScale(5),
    marginHorizontal: moderateScale(10),
    fontSize: moderateScale(18),
  },
  subQuestionTitle: {
    textAlign: 'left',
    alignSelf: 'stretch',
    fontSize: moderateScale(16),
    paddingLeft: moderateScale(10),
  },
  checkboxContent: {
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    alignSelf: 'center',
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
