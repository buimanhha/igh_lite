import React, {Component, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import {Overlay, ListItem, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {BackHandler} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {LocaleConfig} from 'react-native-calendars';
import * as StorageUtils from '../../global/utils/StorageUtils';
import moment from 'moment-timezone';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

LocaleConfig.locales['vn'] = {
  monthNames: [
    'Tháng một',
    'Tháng hai',
    'Tháng ba',
    'Tháng tư',
    'Tháng năm',
    'Tháng sáu',
    'Tháng bảy',
    'Tháng tám',
    'Tháng chín',
    'Tháng mười',
    'Tháng mười một',
    'Tháng mười hai',
  ],
  monthNamesShort: [
    'Tháng một',
    'Tháng hai',
    'Tháng ba',
    'Tháng tư',
    'Tháng năm',
    'Tháng sáu',
    'Tháng bảy',
    'Tháng tám',
    'Tháng chín',
    'Tháng mười',
    'Tháng mười một',
    'Tháng mười hai',
  ],
  dayNames: ['Chủ nhật', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'],
  dayNamesShort: ['CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'],
  today: 'Hôm nay',
};
LocaleConfig.defaultLocale = 'vn';

const beforeReExaminationDate = 3;

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

class ViewCalender extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      allowChoseReExamination: this.props.viewtype === 're-examination',
      valueDate: this.props.valueDate,
      oldDate: moment(this.props.strDate, 'YYYY-MM-DD').startOf('day'),
      strDate: this.props.strDate,
      selectedDate: this.props.selectedDate,
      noticeVisible: false,
      confirmVisible: false,
      contentOverlay: '',
    };
  }

  showNotice = content => {
    this.setState({
      noticeVisible: true,
      contentOverlay: content,
    });
  };

  updateNewReExamination = () => {
    let newDate = this.state.selectedDate;
    let oldDate = this.state.oldDate;
    if (newDate == null || newDate == undefined) {
      this.showNotice('Xin vui lòng chọn ngày tái khám trên màn hình.');
      return;
    }
    if (moment().isAfter(moment(newDate))) {
      this.setState(
        {
          strDate: moment(oldDate).format('YYYY-MM-DD'),
          selectedDate: oldDate,
        },
        () => this.showNotice('Ngày tái khám không hợp lệ.'),
      );
      return;
    }
    if (moment(oldDate).isSame(moment(newDate))) {
      this.showNotice('Bạn chưa thay đổi ngày.');
      return;
    }
    let dayInWeek = moment(newDate).format('dddd');
    if (dayInWeek == 'Sunday') {
      this.setState(
        {
          strDate: moment(oldDate).format('YYYY-MM-DD'),
          selectedDate: oldDate,
        },
        () =>
          this.showNotice(
            `Phòng khám không làm việc vào ngày chủ nhật.\nVui lòng chọn lại ngày tái khám.`,
          ),
      );
      return;
    }
    this.setState({confirmVisible: true});
  };

  cancelChange = () => {
    let oldDate = this.state.oldDate;
    this.setState({
      strDate: moment(oldDate).format('YYYY-MM-DD'),
      selectedDate: oldDate,
      confirmVisible: false,
    });
  };

  updateChange = () => {
    if (this.state.selectedDate != null) {
      let dataContentJson = {};
      let userInfo = this.props.userInfo.userInfo;
      let dataContent = userInfo.data_content;
      if (
        dataContent != null &&
        dataContent !== undefined &&
        dataContent !== ''
      ) {
        dataContentJson = JSON.parse(dataContent);
      }
      dataContentJson.choices.reExaminationDate = this.state.selectedDate;
      this.getReExaminationDate(this.state.selectedDate);
      userInfo.data_content = JSON.stringify(dataContentJson);
      StorageUtils.storeJsonData('userInfo', userInfo);
      this.props.updateUser(userInfo);
    }
    this.setState(
      {
        confirmVisible: false,
      },
      Actions.postSupport(),
    );
  };

  getReExaminationDate = async date => {
    let currentDateTime = new Date().getTime();
    let notifyIdList = await StorageUtils.getJsonData(
      'NotifyIdReExaminationDate',
    );
    if (
      notifyIdList != null &&
      notifyIdList !== undefined &&
      Object.keys(notifyIdList).length !== 0
    ) {
      notifyIdList.forEach((item, index) => {
        NotifyUtils.cancelAllWithId(item);
      });
    }
    notifyIdList = [];
    let rootId = Math.floor(currentDateTime / 1000);
    for (let i = 0; i < beforeReExaminationDate; i++) {
      let reminder = moment(date)
        .add(-1 * i, 'days')
        .toDate();
      reminder.setHours(8);
      reminder.setMinutes(0);
      reminder.setSeconds(0);
      reminder.setMilliseconds(0);
      if (reminder.valueOf() < currentDateTime) {
        continue;
      }
      let id = rootId + i;
      let title = 'Phòng khám Hoàng Long';
      let sticker = 'Nhắc lịch';
      let subContent = 'Lịch tái khám tại phòng khám Hoàng Long';
      let mainContent = '';
      switch (id) {
        case 0:
          mainContent =
            'Hôm nay là lịch tái khám. Vui lòng đến kiểm tra tại phòng khám Hoàng Long';
          break;
        default:
          mainContent =
            'Còn ' +
            i +
            ' ngày nữa sẽ đến lịch tái khám. Vui lòng đến khám vào ngày ' +
            moment(date).format('DD/MM/YYYY');
      }
      NotifyUtils.sendScheduleWithId(
        id,
        reminder,
        mainContent,
        subContent,
        sticker,
        title,
      );
      notifyIdList.push(id);
    }
    await StorageUtils.storeJsonData('NotifyIdReExaminationDate', notifyIdList);
    notifyIdList = await StorageUtils.getJsonData('NotifyIdReExaminationDate');
    return date;
  };

  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    // Actions.home();
    this.props.navigation.popToTop();
    // this.props.navigation.goBack(null);
    return true;
  }

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene === 'viewCalendar') {
      if (
        prevProps.userInfo !== undefined &&
        this.props.userInfo !== undefined &&
        prevProps.userInfo.loading !== undefined &&
        this.props.userInfo.loading !== undefined &&
        this.props.userInfo.loading !== prevProps.userInfo.loading
      ) {
        this.setState({isLoading: this.props.userInfo.loading});
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
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
            <Text style={styles.dateNoticeText}>
              Xin vui lòng xác nhận lịch nhắc tái khám.
            </Text>
            {/* <View>
              <Text style={styles.dateNoticeText}>Ngày cũ:</Text>
              <Text style={styles.dateText}>
                {moment(this.state.oldDate).format('DD-MM-YYYY')}
              </Text>
            </View> */}
            {/* <View style={styles.overlayLineHorizonal} /> */}
            <View>
              <Text style={styles.dateNoticeText}>Ngày dự kiến:</Text>
              <Text style={styles.dateText}>
                {moment(this.state.selectedDate).format('DD-MM-YYYY')}
              </Text>
            </View>
            <View style={styles.overlayLineHorizonal} />
            <View style={{flexDirection: 'row', alignContent: 'space-around'}}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={this.cancelChange}>
                <Text style={styles.overlayTextNormal}>Hủy</Text>
              </TouchableOpacity>
              <View style={styles.overlayLineVertical} />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={this.updateChange}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        {this.allowChoseReExamination && this.state.selectedDate == null && (
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: moderateScale(18)}}>
              Vui lòng chọn ngày dự định tái khám
            </Text>
          </View>
        )}
        {this.state.selectedDate != null && (
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: moderateScale(18)}}>
              Ngày hẹn: {this.state.valueDate}
            </Text>
            <Text style={{fontSize: moderateScale(18)}}>
              (Còn{' '}
              {moment(this.state.selectedDate)
                .startOf('day')
                .diff(moment().startOf('day'), 'days')}{' '}
              ngày)
            </Text>
          </View>
        )}
        {this.state.strDate != null && (
          <Calendar
            style={{marginBottom: 5, width: '100%'}}
            current={this.state.strDate}
            minDate={new Date()}
            onDayPress={day => {
              this.setState({
                valueDate: moment(new Date(day.timestamp)).format('DD-MM-YYYY'),
                strDate: day.dateString,
                selectedDate: new Date(day.timestamp),
              });
            }}
            theme={{
              calendarBackground: 'white',
              textSectionTitleColor: '#2C7770',
              dayTextColor: '#2C7770',
              todayTextColor: 'red',
              selectedDayTextColor: 'white',
              monthTextColor: '#2C7770',
              indicatorColor: '#2C7770',
              selectedDayBackgroundColor: '#2C7770',
              arrowColor: '#2C7770',
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              },
            }}
            // Collection of dates that have to be marked. Default = {}
            markedDates={{
              [this.state.strDate]: {
                selected: true,
                marked: true,
                selectedColor: '#2C7770',
              },
              // '2012-05-17': {marked: true},
              // '2012-05-18': {marked: true, dotColor: 'red', activeOpacity: 0},
              // '2012-05-19': {disabled: true, disableTouchEvent: true},
            }}
          />
        )}
        {this.state.allowChoseReExamination == true && (
          <Button
            onPress={() => this.updateNewReExamination()}
            icon={
              <Icon
                name="check"
                color="#ffffff"
                size={moderateScale(18)}
                style={{marginRight: moderateScale(5)}}
              />
            }
            buttonStyle={{
              borderRadius: 5,
              marginTop: moderateScale(15),
              backgroundColor: '#03A678',
              width: moderateScale(150),
            }}
            title="Cập nhật"
            titleStyle={{
              fontSize: moderateScale(18),
              color: '#ffffff',
            }}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  regimenInfo: state.regimenInfo.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
  endoscopicInfo: state.endoscopicInfo.endoscopicInfo,
  userInfo: state.userInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(ViewCalender);

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
  container: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageButton: {
    height: 95,
    width: 95,
    justifyContent: 'center',
    alignItems: 'center',
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
