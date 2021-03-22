import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, Alert} from 'react-native';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {Actions} from 'react-native-router-flux';
import {ListItem, List} from 'react-native-elements';
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

class PostSupportWithTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: props.tag,
    };
    // if (Platform.OS === 'android') {
    //   UIManager.setLayoutAnimationEnabledExperimental(true);
    // }
    this.props.fetchPostsByTag('tags_contains=' + this.state.tag);
  }

  componentDidMount() {
    // this.props.fetchPostsByTag('tags_contains=' + this.state.tag);
  }

  render() {
    // console.log('**************Posts:' + JSON.stringify(this.props.postsInfo));
    const postsInfo = this.props.postsInfo;
    return (
      <View style={styles.wrapper}>
        {postsInfo == null || postsInfo.length == 0 ? (
          <View style={styles.item}>
            <Text style={styles.title}>Đang cập nhật nội dung</Text>
          </View>
        ) : (
          <ScrollView style={{backgroundColor: 'white', flex: 1}}>
            {postsInfo.map((item, i) => (
              <ListItem
                key={i}
                leftIcon={{name: 'book', color: '#00aced'}}
                title={<Text style={styles.titleText}>{item.title}</Text>}
                onPress={() =>
                  Actions.infomation({url: item.url, content: item.contentHtml})
                }
                topDivider
                chevron
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  postsInfo: state.postsInfo.postsInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(PostSupportWithTag);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    color: '#2C7770', //606070
    fontWeight: 'bold',
  },
});
