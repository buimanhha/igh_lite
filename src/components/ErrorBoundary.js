import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  componentDidCatch(error, info) {
    this.setState({hasError: true});
    this.props.onError(error, info);
  }

  render() {
    if (this.state.hasError) {
      <View style={styles.notfoundForm}>
        <Image
          style={styles.notfoundIcon}
          source={require('../global/asset/icon/notFound.png')}
        />
        <Text style={styles.notfoundText}>
          Hệ thống xảy ra lỗi. Xin vui lòng kiểm tra lại kết nối internet.
        </Text>
      </View>;
    }
    return this.props.children;
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
});
