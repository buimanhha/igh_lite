import React, {Component} from 'react';
import {
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
import * as PostsController from '../../controller/PostsController';
import * as StorageUtils from '../../global/utils/StorageUtils';
import {Actions} from 'react-native-router-flux';
import {ListItem, SearchBar, Icon} from 'react-native-elements';
import moment from 'moment-timezone';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';

//Chiều rộng và cao cho design chuẩn.
const baseWidth = 340;
const baseHeight = 605;
const {height, width} = Dimensions.get('window');
const normalWidth = size => (width / baseWidth) * size;
const normalHeight = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (normalWidth(size) - size) * factor;

const checkTime = new Date().setHours(23, 59, 59, 0);
let arrayholder = [];

const convertVietnamese = text => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

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

class Category extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      isSearch: false,
      isLoading: true,
      categoryInfo: {},
    };
    this.props.fetchCategory();
  }

  clearText = () => {
    this.setState({
      search: '',
      isSearch: false,
    });
  };

  searchText(text) {
    if (text.length == 0) {
      this.clearText();
      return;
    }
    let textData = convertVietnamese(text).toUpperCase();
    let newData = arrayholder.filter(function(item) {
      const itemData = convertVietnamese(item.title).toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      dataSource: newData,
      search: text,
      isSearch: true,
    });
  }

  renderSearch = dataSource => {
    if (dataSource == null || Object.keys(dataSource).length == 0) {
      return (
        <View style={styles.errorForm}>
          <Image
            style={styles.errorIcon}
            source={require('../../global/asset/icon/notFound.png')}
          />
          <Text style={styles.errorTitle}>Không có bài viết</Text>
        </View>
      );
    } else {
      return dataSource.map((item, i) => (
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
    }
  };

  renderCategory = category => {
    if (category == null || Object.keys(category).length == 0) {
      return (
        <View style={styles.errorForm}>
          <Image
            style={styles.errorIcon}
            source={require('../../global/asset/icon/notFound.png')}
          />
          <Text style={styles.errorTitle}>
            Chuyên mục sẽ được cập nhật trong thời gian tới
          </Text>
        </View>
      );
    } else {
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
            Actions.categoryChild({
              categoryId: item.id,
              categoryName: item.name,
            })
          }
          topDivider
        />
      ));
    }
  };

  async componentDidMount() {
    let postsInfo = await StorageUtils.getJsonData('postsInfo');
    if (
      postsInfo == null ||
      postsInfo == undefined ||
      moment(postsInfo.lastTime).diff(moment(checkTime), 'days') != 0
    ) {
      let posts = await PostsController.getPosts();
      if (posts == null) {
        arrayholder = [];
        return;
      }
      arrayholder = posts;
      postsInfo = {
        posts: posts,
        lastTime: new Date(),
      };
      await StorageUtils.storeJsonData('postsInfo', postsInfo);
    } else {
      arrayholder = postsInfo.posts;
    }
  }

  componentDidUpdate(prevProps) {
    if (Actions.currentScene == 'category') {
      if (
        this.props.categoryInfo !== undefined &&
        prevProps.categoryInfo !== undefined &&
        this.props.categoryInfo.loading !== prevProps.categoryInfo.loading
      ) {
        this.setState({
          isLoading: this.props.categoryInfo.loading,
          categoryInfo: this.props.categoryInfo.categoryInfo,
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
        ) : (
          <ScrollView style={styles.scroll}>
            <SearchBar
              round
              showCancel
              lightTheme
              icon={{type: 'font-awesome', name: 'search'}}
              placeholder="Tên bài viết ..."
              value={this.state.search}
              onChangeText={text => this.searchText(text)}
              onClear={() => this.clearText()}
              onCancel={() => this.clearText()}
            />
            {this.state.isSearch
              ? this.renderSearch(this.state.dataSource)
              : this.renderCategory(this.state.categoryInfo)}
          </ScrollView>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  categoryInfo: state.categoryInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(Category);

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
    height: moderateScale(90),
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
});
