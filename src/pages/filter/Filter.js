import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import {Card, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

export default class Filter extends Component {
  constructor(props) {
    super(props);
  }

  cancelQuestion = () => {
    Actions.home();
  };

  answerQuestion = () => {
    Actions.filterQuestion({allowRetry: true});
  };

  async componentDidMount() {}

  render() {
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          source={require('../../global/asset/images/background.jpg')}
          style={styles.background}>
          <View style={styles.container}>
            <Card
              title="SÀNG LỌC TRƯỚC NỘI SOI"
              titleStyle={{fontSize: moderateScale(18)}}
              containerStyle={{borderRadius: 10}}>
              <Text
                style={{
                  marginBottom: moderateScale(5),
                  fontSize: moderateScale(18),
                  textAlign: 'justify',
                }}>
                Nội soi đại tràng cần chỉ định của bác sĩ, thông tin dưới đây
                nhằm xác nhận bạn đủ điều kiện để tiến hành uống thuốc. Xin vui
                lòng trả lời tất cả các câu hỏi sau đây.
              </Text>
              <View style={styles.groupBtn}>
                <Button
                  icon={
                    <Icon
                      name="times"
                      color="#ffffff"
                      size={moderateScale(16)}
                      style={{marginRight: moderateScale(5)}}
                    />
                  }
                  buttonStyle={styles.stopBtn}
                  titleStyle={styles.fontBtn}
                  title="Hủy"
                  onPress={this.cancelQuestion}
                />
                <Button
                  iconRight
                  icon={
                    <Icon
                      name="arrow-right"
                      color="#ffffff"
                      size={moderateScale(16)}
                      style={{marginLeft: moderateScale(5)}}
                    />
                  }
                  buttonStyle={styles.activeBtn}
                  titleStyle={styles.fontBtn}
                  title="Tiếp tục"
                  onPress={this.answerQuestion}
                />
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
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  //button
  fontBtn: {
    fontSize: moderateScale(16),
  },
  groupBtn: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  stopBtn: {
    backgroundColor: '#F25C5C',
    width: normalWidth(90),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  activeBtn: {
    backgroundColor: '#03A678',
    width: normalWidth(90),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
});
