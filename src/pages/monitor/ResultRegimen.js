import React, {Component, useState, useEffect} from 'react';
import * as Constants from '../../global/constants';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Alert,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Input, Button, Card, Image} from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import {Actions} from 'react-native-router-flux';
//redux
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
//end
import moment from 'moment';
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

class ResultRegimen extends Component {
  constructor(props) {
    super(props);
  }

  buildContent() {
    let regimenPatientInfo = this.props.regimenPatientInfo;
    if (regimenPatientInfo == null || regimenPatientInfo == undefined) {
      console.log('ResultRegimen|Not found regimen patient info');
      return this.buildExceptionContent();
    }
    switch (regimenPatientInfo.state) {
      case Constants.PATIENT_STATE_POST_SUPPORT:
        return this.buildFinishContent();
      case Constants.PATIENT_STATE_POST_SUPPORT_NOT_ENOUGH_CONDITION:
        return this.buildNotEnoughContent();
      case Constants.PATIENT_STATE_CONFIRM_SUSPEND:
        return this.buildSuspendContent();
      case Constants.PATIENT_STATE_CONFIRM_NOT_CLEAN:
        return this.buildNotCleanContent();
      default:
        console.log(
          'ResultRegimen|Not found state = ' + regimenPatientInfo.state,
        );
        return this.buildExceptionContent();
    }
  }

  buildExceptionContent() {
    return (
      <Card title="TÍNH NĂNG TẠM DỪNG" titleStyle={styles.titleCard}>
        <Image
          style={styles.imageCard}
          resizeMode="cover"
          source={require('../../global/asset/images/HoangLongClinic.jpg')}
        />
        <Text style={styles.textCard}>
          Xin liên hệ nhân viên y tế để mở tính năng.
        </Text>
      </Card>
    );
  }

  buildFinishContent() {
    return (
      <Card title="HOÀN THÀNH UỐNG THUỐC" titleStyle={styles.titleCard}>
        <Image
          style={styles.imageCard}
          resizeMode="cover"
          source={require('../../global/asset/images/HoangLongClinic.jpg')}
        />
        <Text style={styles.textCard}>
          Cảm ơn bạn đã hoàn thành quá trình chuẩn bị nội soi. Xin liên hệ nhân
          viên y tế để tiến hành nội soi.
        </Text>
      </Card>
    );
  }

  buildNotEnoughContent() {
    return (
      <Card title="CHƯA ĐỦ ĐIỀU KIỆN NỘI SOI" titleStyle={styles.titleCard}>
        <Image
          style={styles.imageCard}
          resizeMode="cover"
          source={require('../../global/asset/images/HoangLongClinic.jpg')}
        />
        <Text style={styles.textCard}>
          Số lần đi ngoài của bạn chưa đủ điều kiện để soi. Đề nghị liên hệ với
          nhân viên y tế để được hướng dẫn.
        </Text>
      </Card>
    );
  }

  buildNotCleanContent() {
    return (
      <Card title="CHƯA ĐỦ ĐIỀU KIỆN NỘI SOI" titleStyle={styles.titleCard}>
        <Image
          style={styles.imageCard}
          resizeMode="cover"
          source={require('../../global/asset/images/HoangLongClinic.jpg')}
        />
        <Text style={styles.textCard}>
          Màu nước phân đi ngoài của bạn chưa đủ điều kiện để soi. Đề nghị liên
          hệ với nhân viên y tế để được hướng dẫn.
        </Text>
      </Card>
    );
  }

  buildSuspendContent() {
    return (
      <Card title="PHÁC ĐỒ TẠM DỪNG" titleStyle={styles.titleCard}>
        <Image
          style={styles.imageCard}
          resizeMode="cover"
          source={require('../../global/asset/images/HoangLongClinic.jpg')}
        />
        <Text style={styles.textCard}>
          Bạn đã xác nhận tạm dừng quá trình chuẩn bị. Đề nghị liên hệ nhân viên
          y tế để được kích hoạt lại.
        </Text>
      </Card>
    );
  }

  render() {
    let renderContent = this.buildContent();
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            {renderContent}
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(ResultRegimen);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  imageCard: {width: '100%', height: normalHeight(150)},
  titleCard: {fontSize: moderateScale(20)},
  textCard: {
    fontSize: moderateScale(18),
    margin: moderateScale(5),
    textAlign: 'justify',
  },
});
