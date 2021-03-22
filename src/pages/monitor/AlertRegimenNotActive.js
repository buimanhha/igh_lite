import React, {Component, useState, useEffect} from 'react';
import {Buttons, Colors, Typography, Spacing} from '../../global/styles/index';
import * as NotifyUtils from '../../global/utils/NotifyUtils';
import * as Constants from '../../global/constants';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
  ImageBackground,
  Platform,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActionButton from 'react-native-action-button';
import {ScrollView} from 'react-native-gesture-handler';
import {CheckBox, Card, Button} from 'react-native-elements';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

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

class AlertRegimenNotActive extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  callSupport = () => {
    this.dialCall(19008904);
  };

  dialCall = number => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber);
  };

  componentDidMount() {}

  render() {
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          <View style={styles.container}>
            <Card
              title="Chú ý !"
              titleStyle={{fontSize: 20, color: '#cb3837'}}
              imageStyle={{height: 250}}
              image={require('../../global/asset/images/nurse.png')}>
              <Text
                style={{
                  marginBottom: 10,
                  fontSize: 20,
                  color: '#2C7770',
                  textAlign: 'justify',
                }}>
                Đề nghị liên hệ nhân viên tiếp đón phòng nội soi để được kích
                hoạt chức năng này. Xin cảm ơn.
              </Text>
              <Button
                onPress={() => this.callSupport()}
                buttonStyle={{backgroundColor: '#2C7770'}}
                icon={{name: 'phone', color: 'white'}}
                title="Hotline"
              />
            </Card>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  filterRegimen: state.filterRegimen,
  regimenInfo: state.regimenInfo.regimenInfo,
  regimenPatientInfo: state.regimenPatientInfo.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(AlertRegimenNotActive);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
