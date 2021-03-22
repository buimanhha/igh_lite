import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import {CheckBox, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

export default class ErrorCommon extends Component {
  static propTypes = {
    isShow: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {isShow: false};
  }

  close() {
    this.setState({
      isShow: false,
    });
  }

  render() {
    return (
      <Overlay isVisible={this.state.isShow}>
        <Image
          style={styles.notfoundIcon}
          source={require('../global/asset/icon/error.png')}
        />
        <Text style={styles.notfoundText}>
          Hệ thống xảy ra lỗi.{'\n'}
          Xin vui lòng kiểm tra lại kết nối internet hoặc khởi động lại ứng
          dụng.
        </Text>
        <Button
          icon={
            <Icon
              name="arrow-left"
              color="#ffffff"
              size={moderateScale(16)}
              style={{marginRight: moderateScale(5)}}
            />
          }
          disabled={count == 0}
          titleStyle={styles.fontBtn}
          buttonStyle={styles.activeBtn}
          disabledTitleStyle={{color: '#fff'}}
          title="Đóng"
          onPress={this.close}
        />
      </Overlay>
    );
  }
}

const styles = StyleSheet.create({
  notfoundForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  notfoundIcon: {
    height: 90,
    width: 90,
    alignSelf: 'center',
  },
  notfoundText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    color: '#2C7770',
  },
  //button
  fontBtn: {
    fontSize: moderateScale(16),
  },
  activeBtn: {
    backgroundColor: '#03A678',
    width: normalWidth(90),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
});
