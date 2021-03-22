import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Card,
  CardItem,
  Thumbnail,
  Left,
  Right,
  Button,
  Body,
} from 'native-base';
import {api_end_point, backend_auth_key} from '../../GlobalCfg';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
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

class Service extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
    //Bai viet ve goi dich vu (type = 2)
    this.props.fetchPosts(2);
  }

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

  componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'serviceDetail') {
      if (
        this.props.postsInfo !== undefined &&
        prevProps.postsInfo !== undefined &&
        this.props.postsInfo.loading !== prevProps.postsInfo.loading
      ) {
        this.setState({
          isLoading: this.props.postsInfo.loading,
        });
      }
    }
  }

  render() {
    return (
      <View style={styles.wrapper}>
        {this.state.isLoading ? (
          <View style={styles.loadingForm}>
            <ActivityIndicator size="large" />
            <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
          </View>
        ) : this.props == null ||
          this.props.postsInfo.postsInfo == null ||
          this.props.postsInfo.error == true ||
          this.props.postsInfo.postsInfo.length == 0 ? (
          <View style={styles.errorForm}>
            <Image
              style={styles.errorIcon}
              source={require('../../global/asset/icon/notFound.png')}
            />
            <Text style={styles.errorTitle}>Đang cập nhật nội dung</Text>
          </View>
        ) : (
          <FlatList
            data={this.props.postsInfo.postsInfo}
            keyExtractor={(item, index) => index.toString()}
            // ItemSeparatorComponent={this.FlatListItemSeparator}
            renderItem={({item, index}) => (
              <Card
                style={{
                  borderRadius: 10,
                  marginLeft: 20,
                  marginRight: 20,
                  marginBottom: 10,
                  marginTop: 10,
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
                    <Thumbnail
                      square
                      small
                      source={{
                        uri: api_end_point + item.image.url,
                      }}
                    />
                    <Body>
                      <Text style={styles.noticeTitle}>{item.title}</Text>
                    </Body>
                  </Left>
                </CardItem>
                <TouchableOpacity
                  onPress={() => Actions.infomation({url: item.url})}>
                  <CardItem bordered style={{paddingTop: 5, paddingBottom: 5}}>
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
                    }}>
                    <Left>
                      {/* <Text style={styles.noticeTime}>
                        {this.getDateString(item.created_at)}
                      </Text> */}
                      <Image
                        style={styles.starIcon}
                        source={require('../../global/asset/icon/stars.png')}
                      />
                    </Left>
                    <Right>
                      <Button
                        transparent
                        onPress={() => Actions.infomation({url: item.url})}>
                        <Icon style={styles.noticeIcon} name="book" size={20} />
                        <Text style={{fontWeight: 'bold'}}>Xem chi tiết</Text>
                      </Button>
                    </Right>
                  </CardItem>
                </TouchableOpacity>
              </Card>
            )}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  postsInfo: state.postsInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Service);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  titlePage: {
    fontSize: 18,
    color: '#2C7770',
    fontWeight: 'bold',
    paddingVertical: 5,
    marginHorizontal: 5,
    textAlign: 'justify',
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
  starIcon: {
    height: 35,
    width: 150,
    alignSelf: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    color: '#2C7770',
  },
  scrollView: {
    // flex:1,
    margin: 5,
    backgroundColor: 'pink',
    marginHorizontal: 20,
  },
  noticeItem: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noticeContent: {
    width: '85%',
  },
  noticeIcon: {
    marginRight: 5,
    color: '#2C7770',
  },
  noticeTitle: {
    flexWrap: 'wrap',
    fontSize: 18,
    // color: '#2C7770',
    fontWeight: 'bold',
  },
  noticeTime: {
    fontSize: 14,
    // color: '#2C7770',
  },
  noticeDecs: {
    textAlign: 'justify',
    fontSize: 16,
    // color: '#2C7770',
  },
});
