import React, {Component} from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {Actions} from 'react-native-router-flux';
import {ListItem, List, Icon} from 'react-native-elements';
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

class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      categoryId: this.props.categoryId,
      categoryName: this.props.categoryName,
      postsInfo: {},
      error: false,
    };
    this.props.fetchPostsByCategory({
      type: 1,
      categoryId: this.state.categoryId,
    });
  }

  componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'Posts') {
      if (
        this.props.postsInfo !== undefined &&
        prevProps.postsInfo !== undefined &&
        this.props.postsInfo.loading !== prevProps.postsInfo.loading
      ) {
        this.setState({
          isLoading: this.props.postsInfo.loading,
          postsInfo: this.props.postsInfo.postsInfo,
        });
      }
    }
  }

  componentDidMount() {}

  render() {
    let postsInfo = this.state.postsInfo;
    return (
      <View style={styles.wrapper}>
        <View
          style={{
            backgroundColor: '#F2CD5C',
            flexDirection: 'row',
            justifyContent: 'center',
            paddingVertical: moderateScale(5),
          }}>
          <Icon
            name="book"
            type="octicon"
            color="#2C7770"
            size={moderateScale(30)}
          />
          <Text style={styles.titleCategory}>{this.state.categoryName}</Text>
        </View>
        {this.state.isLoading ? (
          <View style={styles.loadingForm}>
            <ActivityIndicator size="large" />
            <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
          </View>
        ) : postsInfo == null || postsInfo.length == 0 ? (
          <View style={styles.errorForm}>
            <Image
              style={styles.errorIcon}
              source={require('../../global/asset/icon/notFound.png')}
            />
            <Text style={styles.errorTitle}>Đang cập nhật nội dung</Text>
          </View>
        ) : (
          <ScrollView style={{backgroundColor: 'white'}}>
            {postsInfo.map((item, i) => (
              <ListItem
                key={i}
                leftIcon={
                  item.isVideo ? (
                    <Icon
                      name="youtube"
                      type="font-awesome"
                      color="#c4302b"
                      size={moderateScale(25)}
                    />
                  ) : (
                    <Icon
                      name="globe"
                      type="octicon"
                      color="#2089dc"
                      size={moderateScale(25)}
                    />
                  )
                }
                rightIcon={{name: 'arrow-forward', size: moderateScale(20)}}
                title={<Text style={styles.titleText}>{item.title}</Text>}
                onPress={() =>
                  Actions.infomation({url: item.url, content: item.contentHtml})
                }
                topDivider
              />
            ))}
          </ScrollView>
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
)(Posts);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  titleCategory: {
    fontSize: 18,
    // color: '#2C7770',
    fontWeight: 'bold',
    paddingVertical: 5,
    marginHorizontal: 5,
  },
  titleText: {
    fontSize: 16,
    // color: '#2C7770',
    fontWeight: 'bold',
  },
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    marginVertical: 10,
    color: '#2C7770',
  },
});
