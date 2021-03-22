import React, {Component} from 'react';
import {
  View,
  Linking,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';
import {SocialIcon, Text, Card, Button} from 'react-native-elements';
import Hr from 'react-native-hr-component';
import {from} from 'rxjs';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';
import {ScrollView} from 'react-native-gesture-handler';

const linkWeb = 'https://www.hoanglongclinic.vn/vi//lien-he';
const linkZalo = 'https://zalo.me/0986954448';
const linkYoutube = 'https://www.youtube.com/channel/UCTMegdGcd4D9RTc1-r8h1xg';
const linkFacebook = 'https://www.facebook.com/phongkhamdakhoahoanglong';

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
    Alert.alert('Lỗi hệ thống', `Xin vui lòng khởi động lại ứng dụng !`, [
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

export default class Contact extends Component {
  dialCall = number => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber);
  };

  openWeb = () => {
    Linking.openURL(linkWeb).catch(err =>
      console.error('An error occurred', err),
    );
  };

  openZalo = () => {
    Linking.openURL(linkZalo).catch(err =>
      console.error('An error occurred', err),
    );
  };

  openYoutube = () => {
    Linking.openURL(linkYoutube).catch(err =>
      console.error('An error occurred', err),
    );
  };

  openFacebook = () => {
    Linking.openURL(linkFacebook).catch(err =>
      console.error('An error occurred', err),
    );
  };

  openMap = () => {
    // console.log("Call open map direction");
    if (Platform.OS === 'android') {
      Linking.openURL(`geo:21.00862,105.838622?q=${'9 Đào Duy Anh'}`);
    } else {
      Linking.openURL(
        `https://maps.apple.com/?q=${'9 Đào Duy Anh'}&&ll=21.00862,105.838622`,
      );
    }
    // Linking.openURL(`https://maps.apple.com/?q=${markerName}&ll=${lat},${lng}`);
    // Linking.openURL(`https://maps.apple.com/?q=${'9 Đào Duy Anh'}&&ll=21.00862,105.838622`);
    // Linking.openURL(`geo:21.00862,105.838622?q=${'9 Đào Duy Anh'}`);
  };

  render() {
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          style={styles.background}
          source={require('../../global/asset/images/background.jpg')}>
          <ScrollView>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                marginVertical: 10,
              }}>
              <Hr
                textStyles={styles.titleText}
                lineColor="#2C7770"
                text="Thời gian làm việc"
              />
              <Text style={styles.contentText}>
                07h30 - 17h00 | Thứ 2 - Thứ 7
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                <TouchableOpacity
                  style={styles.hotlineButton}
                  onPress={() => this.dialCall(19008904)}>
                  <Text style={styles.titleText}>
                    <Icon name="phone" size={20} /> Hotline 1{'\n'}19008904
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hotlineButton}
                  onPress={() => this.dialCall(+842462811331)}>
                  <Text style={styles.titleText}>
                    <Icon name="phone" size={20} /> Hotline 2{'\n'}02462811331
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                marginVertical: 10,
              }}>
              <Hr
                textStyles={styles.titleText}
                lineColor="#2C7770"
                text="Địa chỉ phòng khám"
              />
              <View
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'space-evenly',
                }}>
                <Text style={styles.addressText}>
                  <Text style={{fontWeight: 'bold', fontSize: 18}}>
                    Cơ sở 1
                  </Text>
                  : Tầng 10, tòa tháp VCCI, số 9 Đào Duy Anh, Đống Đa, Hà Nội
                </Text>
                <Text style={styles.addressText}>
                  <Text style={{fontWeight: 'bold', fontSize: 18}}>
                    Cơ sở 2
                  </Text>
                  : Tầng 18, tòa nhà CONINCO Tower, số 4 Tôn Thất Tùng, Đống Đa,
                  Hà Nội
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  // onPress={() => Actions.mapLocation()}>
                  onPress={() => this.openMap()}>
                  <Text style={styles.labelButton}>
                    <Icon color="white" name="map-marker" size={20} /> Bản Đồ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                marginVertical: 10,
              }}>
              <Hr
                textStyles={styles.titleText}
                lineColor="#2C7770"
                text="Mạng Xã Hội"
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => this.openWeb()}>
                  <Image
                    style={styles.imageButton}
                    source={require('../../global/asset/logo/web.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => this.openFacebook()}>
                  <Image
                    style={styles.imageButton}
                    source={require('../../global/asset/logo/facebook.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => this.openYoutube()}>
                  <Image
                    style={styles.imageButton}
                    source={require('../../global/asset/logo/youtube.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => this.openZalo()}>
                  <Image
                    style={styles.imageButton}
                    source={require('../../global/asset/logo/zalo.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
}

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
    alignItems: 'stretch',
  },
  phoneNumber: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
  },
  row: {
    marginVertical: 5,
  },
  hrText: {
    fontSize: 18,
  },
  titleText: {
    textAlign: 'center',
    color: '#2C7770',
    marginHorizontal: 10,
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentText: {
    textAlign: 'center',
    color: '#2C7770',
    fontSize: 18,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  addressText: {
    textAlign: 'left',
    color: '#2C7770',
    fontSize: 18,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  hotlineButton: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#2C7770',
    width: 150,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 50,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  imageButton: {
    height: 50,
    width: 50,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: '#2C7770',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  labelButton: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});
