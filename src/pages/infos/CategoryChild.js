import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
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

class CategoryChild extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      categoryInfo: [],
      categoryId: this.props.categoryId,
      categoryName: this.props.categoryName,
    };
  }

  renderCategory = category => {
    if (category == null || category == undefined) {
      return;
    }
    return category.map((item, i) => (
      <ListItem
        key={i}
        leftIcon={
          <Icon
            name="file-directory"
            type="octicon"
            color="#2089dc"
            size={moderateScale(25)}
          />
        }
        rightIcon={{name: 'arrow-forward', size: moderateScale(20)}}
        title={<Text style={styles.titleText}>{item.name}</Text>}
        onPress={() =>
          Actions.Posts({categoryId: item.id, categoryName: item.name})
        }
        topDivider
      />
    ));
  };

  renderPosts = posts => {
    if (posts == null || posts == undefined) {
      return;
    }
    return posts.map((item, i) => (
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
    ));
  };

  componentDidMount() {
    this.props.fetchCategoryChild(this.state.categoryId);
  }

  componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'categoryChild') {
      if (
        this.props.categoryChildInfo !== undefined &&
        prevProps.categoryChildInfo !== undefined &&
        this.props.categoryChildInfo.loading !==
          prevProps.categoryChildInfo.loading
      ) {
        let categoryInfo = this.props.categoryChildInfo.categoryInfo;
        // console.log('Update|' + JSON.stringify(this.props.categoryChildInfo));
        if (categoryInfo != null && categoryInfo != undefined) {
          this.state.categoryInfo = categoryInfo;
        }
        this.setState({
          isLoading: this.props.categoryChildInfo.loading,
        });
      }
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loadingForm}>
          <ActivityIndicator size="large" />
          <Text style={styles.errorTitle}>Vui lòng đợi trong giây lát</Text>
        </View>
      );
    }
    let categoryInfo = this.state.categoryInfo;
    if (categoryInfo == null || categoryInfo == undefined) {
      return (
        <View style={styles.wrapper}>
          <View style={styles.errorForm}>
            <Image
              style={styles.errorIcon}
              source={require('../../global/asset/icon/notFound.png')}
            />
            <Text style={styles.errorTitle}>
              Vui lòng kiểm tra lại kết nối internet
            </Text>
          </View>
        </View>
      );
    }
    let category = categoryInfo[0];
    let posts = categoryInfo[1];
    if (
      (category == null || category == undefined) &&
      (posts == null || posts == undefined)
    ) {
      return (
        <View style={styles.wrapper}>
          <View style={styles.errorForm}>
            <Image
              style={styles.errorIcon}
              source={require('../../global/asset/icon/notFound.png')}
            />
            <Text style={styles.errorTitle}>
              Chuyên mục sẽ được cập nhật trong thời gian tới
            </Text>
          </View>
        </View>
      );
    } else {
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
          <ScrollView style={styles.scroll}>
            {this.renderCategory(category)}
            {this.renderPosts(posts)}
          </ScrollView>
        </View>
      );
    }
  }
}

const mapStateToProps = state => ({
  categoryChildInfo: state.categoryInfo,
  postInfo: state.postInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(CategoryChild);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: moderateScale(16),
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
    height: normalHeight(90),
    width: moderateScale(90),
    alignSelf: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    marginVertical: moderateScale(10),
    color: '#2C7770',
  },
  titleCategory: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginHorizontal: moderateScale(5),
  },
});
