/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Card} from 'react-native-elements';
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
    Alert.alert('Lỗi hệ thống', 'Xin vui lòng thử lại ứng dụng !', [
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

export default class ForgotPwd extends Component {
  dialCall = number => {
    let phoneNumber =
      Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`;
    Linking.openURL(phoneNumber);
  };

  render() {
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          source={require('../../global/asset/images/background.jpg')}
          style={styles.background}>
          <View style={styles.container}>
            <Card
              title="LƯU Ý"
              style={{height: hp('80%')}}
              titleStyle={{fontSize: 18}}
              containerStyle={{borderRadius: 10}}>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'justify',
                }}>
                Vui lòng gọi đến hotline của phòng khám để được hỗ trợ. Xin cảm
                ơn.
              </Text>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Card
                  containerStyle={{
                    width: wp('45%'),
                    height: hp('12%'),
                    borderRadius: 10,
                    justifyContent: 'center',
                  }}>
                  <Text style={styles.titleText}>
                    <Icon name="phone" size={20} /> Hotline 1
                  </Text>
                  <TouchableOpacity onPress={() => this.dialCall(19008904)}>
                    <Text style={styles.phoneNumber}>19008904</Text>
                  </TouchableOpacity>
                </Card>
                <Card
                  containerStyle={{
                    width: wp('45%'),
                    height: hp('12%'),
                    borderRadius: 10,
                    justifyContent: 'center',
                  }}>
                  <Text style={styles.titleText}>
                    <Icon name="phone" size={20} /> Hotline 2
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.dialCall(+842462811331)}>
                    <Text style={styles.phoneNumber}>02462811331</Text>
                  </TouchableOpacity>
                </Card>
              </View>
            </Card>
          </View>
        </ImageBackground>
      </View>
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
    margin: 15,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  rowInput: {
    marginLeft: '10%',
    marginRight: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowPhone: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#2C7770',
    fontWeight: 'bold',
  },
  titleText: {
    textAlign: 'center',
    fontSize: 16,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: 'bold',
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
