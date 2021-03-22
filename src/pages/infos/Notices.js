import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import * as StorageUtils from '../../global/utils/StorageUtils';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Card, CardItem, Body, Left} from 'native-base';
import {Image} from 'react-native-elements';
import moment from 'moment';
import {ScrollView} from 'react-native-gesture-handler';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

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

class Notice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      haveReExaminationDate: false,
      haveResultDate: false,
      reExaminationDate: undefined,
      resultDate: undefined,
    };
    this.init();
    this.props.fetchNotice();
  }

  init = async () => {
    let userInfo = this.props.userInfo;
    if (userInfo == null || userInfo == undefined) {
      userInfo = await StorageUtils.getJsonData('userInfo');
    }
    if (
      userInfo != null &&
      userInfo != undefined &&
      Object.keys(userInfo).length > 0
    ) {
      let dataContent = userInfo.data_content;
      if (
        dataContent == null ||
        dataContent == undefined ||
        dataContent == ''
      ) {
        return;
      }
      dataContent = JSON.parse(userInfo.data_content);
      if (
        dataContent != null &&
        dataContent != undefined &&
        Object.keys(dataContent).length > 0
      ) {
        let choices = dataContent.choices;
        let reExaminationDate = choices.reExaminationDate;
        let resultDate = choices.resultDate;
        if (reExaminationDate != null && reExaminationDate != undefined) {
          this.setState({
            haveReExaminationDate: true,
            reExaminationDate: this.getDateString(reExaminationDate),
          });
        }
        if (resultDate != null && resultDate != undefined) {
          this.setState({
            haveResultDate: true,
            resultDate: this.getDateString(resultDate),
          });
        }
      }
    }
  };

  getDateString = value => {
    if (value !== undefined && value !== null) {
      return 'Ngày: ' + moment(value).format('DD-MM-YYYY');
    }
    return '';
  };

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

  async componentDidUpdate(prevProps) {
    if (Actions.currentScene == '_notice') {
      if (
        prevProps.noticeInfo !== undefined &&
        this.props.noticeInfo !== undefined &&
        prevProps.noticeInfo.loading != undefined &&
        this.props.noticeInfo.loading != undefined &&
        this.props.noticeInfo.loading !== prevProps.noticeInfo.loading
      ) {
        this.setState({isLoading: this.props.noticeInfo.loading});
      }
    }
  }

  render() {
    let noticeInfo = this.props.noticeInfo.noticeInfo;
    return (
      <View style={styles.wrapper}>
        <ImageBackground
          source={require('../../global/asset/images/background.jpg')}
          style={styles.background}>
          {this.state.isLoading ? (
            <View style={styles.loadingForm}>
              <ActivityIndicator size="large" />
              <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
            </View>
          ) : noticeInfo == null ||
            noticeInfo == undefined ||
            noticeInfo.length == 0 ? (
            <View style={styles.item}>
              <Text style={styles.title}>Không có thông báo</Text>
            </View>
          ) : (
            <ScrollView>
              {this.state.haveReExaminationDate && (
                <TouchableOpacity>
                  <Card
                    style={{
                      borderRadius: 10,
                      marginLeft: 20,
                      marginRight: 20,
                      marginBottom: 10,
                    }}>
                    <CardItem
                      header
                      bordered
                      style={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}>
                      <Left>
                        <Image
                          source={require('../../global/asset/icon/schedule.png')}
                          style={{width: 30, height: 30}}
                        />
                        <Body>
                          <Text style={styles.noticeTitle}>Lịch tái khám</Text>
                        </Body>
                      </Left>
                    </CardItem>
                    <CardItem>
                      <Body>
                        <Text style={styles.noticeDecs}>
                          {this.state.reExaminationDate}
                        </Text>
                      </Body>
                    </CardItem>
                    <CardItem
                      footer
                      bordered
                      style={{
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}
                    />
                  </Card>
                </TouchableOpacity>
              )}
              {this.state.haveResultDate && (
                <TouchableOpacity>
                  <Card
                    style={{
                      borderRadius: 10,
                      marginLeft: 20,
                      marginRight: 20,
                      marginBottom: 10,
                    }}>
                    <CardItem
                      header
                      bordered
                      style={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}>
                      <Left>
                        <Image
                          source={require('../../global/asset/icon/schedule.png')}
                          style={{width: 30, height: 30}}
                        />
                        <Body>
                          <Text style={styles.noticeTitle}>
                            Lịch lấy kết quả sinh thiết
                          </Text>
                        </Body>
                      </Left>
                    </CardItem>
                    <CardItem>
                      <Body>
                        <Text style={styles.noticeDecs}>
                          {this.state.resultDate}
                        </Text>
                      </Body>
                    </CardItem>
                    <CardItem
                      footer
                      bordered
                      style={{
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}
                    />
                  </Card>
                </TouchableOpacity>
              )}
              <FlatList
                data={noticeInfo}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() => Actions.infomation({url: item.url})}>
                    <Card
                      style={{
                        borderRadius: 10,
                        marginLeft: 20,
                        marginRight: 20,
                        marginBottom: 10,
                      }}>
                      <CardItem
                        header
                        bordered
                        style={{
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}>
                        <Left>
                          <Image
                            source={require('../../global/asset/icon/email.png')}
                            style={{width: 30, height: 30}}
                          />
                          <Body>
                            <Text style={styles.noticeTitle}>{item.title}</Text>
                          </Body>
                        </Left>
                      </CardItem>
                      <CardItem>
                        <Body>
                          <Text style={styles.noticeDecs}>{item.desc}</Text>
                        </Body>
                      </CardItem>
                      <CardItem
                        footer
                        bordered
                        style={{
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                          paddingTop: 5,
                          paddingBottom: 5,
                        }}
                      />
                    </Card>
                  </TouchableOpacity>
                )}
              />
            </ScrollView>
          )}
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  noticeInfo: state.noticeInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Notice);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    // flex:1,
    margin: 5,
    marginHorizontal: 20,
  },
  noticeItem: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    // borderBottomWidth: 1,
    // borderColor: '#2C7770',
  },
  noticeContent: {
    width: '85%',
  },
  noticeIcon: {
    marginTop: 5,
    color: '#2C7770',
  },
  noticeTitle: {
    flexWrap: 'wrap',
    marginLeft: 10,
    fontSize: 18,
    // color: '#2C7770',
    fontWeight: 'bold',
  },
  noticeTime: {
    paddingTop: 5,
    fontSize: 14,
    color: '#0095ff',
  },
  noticeDecs: {
    textAlign: 'left',
    fontSize: 16,
  },
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    color: '#2C7770',
  },
});
