import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as StorageUtils from '../../global/utils/StorageUtils';
import * as PatientController from '../../controller/PatientController';
import * as Constants from '../../global/constants';
import {Actions} from 'react-native-router-flux';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import store from '../../redux/stores';
import {CheckBox, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import {flatMap} from 'rxjs/operators';
import * as CommonService from '../../services/CommonService';

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

class FilterResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showOverlay: false,
      contentOverlay: '',
      allowRetry: this.props.allowRetry,
      allowSave: this.props.allowSave,
      questions: this.props.questions,
      answers: this.props.answers,
    };
  }

  showNotice = content => {
    this.setState({
      showOverlay: true,
      contentOverlay: content,
    });
  };

  backQuestion = () => {
    let allowRetry = this.state.allowRetry;
    let allowSave = this.state.allowSave;
    if (CommonService.isNull(allowRetry) && CommonService.isNull(allowSave)) {
      Actions.filterQuestion({
        allowRetry: this.state.allowRetry,
        edit: this.state.allowSave,
        count: this.state.questions.length - 1,
        questions: this.state.questions,
        answers: this.state.answers,
      });
    } else {
      Actions.home();
    }
  };

  resetQuestion = () => {
    Actions.filterQuestion({
      count: 0,
      edit: true,
      allowRetry: true,
    });
  };

  saveQuestion = async () => {
    let isNotOk = false;
    let answers = this.state.answers;
    answers.forEach((element, index) => {
      if (CommonService.isNull(element)) {
        isNotOk = false;
      }
      if (Array.isArray(element)) {
        element.forEach((elementSub, indexSub) => {
          if (elementSub == null || elementSub === undefined) {
            isNotOk = false;
            return;
          }
          isNotOk = isNotOk || elementSub;
        });
      } else {
        isNotOk = isNotOk || element;
      }
    });
    let infoRegimen = this.props.regimenPatientInfo.regimenPatientInfo;
    if (CommonService.isNull(infoRegimen)) {
      this.setState({isLoading: false}, () =>
        this.showNotice(
          'Bạn chưa có phác đồ. Vui lòng liên hệ với nhân viên phòng khám để cấp lại phác đồ !',
        ),
      );
      return;
    }
    let activeCode = infoRegimen.active_code;
    // console.log('====>> ' + activeCode);
    if (CommonService.isNullOrEmptyStr(activeCode)) {
      activeCode = this.props.userInfo.userInfo.ext_id;
      if (CommonService.isNullOrEmptyStr(activeCode)) {
        this.setState({isLoading: false}, () =>
          this.showNotice(
            'Lỗi thông tin mã bệnh nhân từ hệ thống. Vui lòng liên hệ với nhân viên phòng khám !',
          ),
        );
        return;
      }
    }
    let stateRegimen = isNotOk
      ? Constants.PATIENT_AFTER_FILTER_NOT_ALLOW_REGIMEN
      : Constants.PATIENT_STATE_IDLE;
    infoRegimen.state = stateRegimen;
    infoRegimen.other_data = JSON.stringify({
      quests: this.state.questions,
      answer: this.state.answers,
    });
    //Location
    let location = CommonService.getLocationFromCode(activeCode);
    let infoResponse = await PatientController.updateRegimenPatientFields_2(
      infoRegimen.patient_regimen_id,
      {
        state: infoRegimen.state,
        other_data: infoRegimen.other_data,
        location_id: location,
      },
    );
    if (infoResponse == null) {
      await this.setState({isLoading: false});
      this.showNotice(
        'Xin vui lòng đảm bảo kết nối internet cho thao tác này.',
      );
      return;
    }
    let jsonResponse = await infoResponse.json();
    if (
      jsonResponse != null &&
      jsonResponse !== undefined &&
      jsonResponse.affectedRows > 0
    ) {
      store.dispatch(actions.storeRegimenPatient(infoRegimen));
      await StorageUtils.storeJsonData('regimenPatientInfo', infoRegimen);
    } else {
      await this.setState({isLoading: false});
      this.showNotice(
        'Xin vui lòng đảm bảo kết nối internet cho thao tác này.',
      );
      return;
    }
    this.state.allowSave = false;
    if (isNotOk) {
      await this.setState({isLoading: false, showLocation: false});
      this.showNotice(
        'Bạn không đủ điều kiện để tự uống thuốc. Đề nghị liên hệ nhân viên y tế để được hướng dẫn cụ thể.',
      );
    } else {
      await this.setState({isLoading: false, showLocation: false});
      this.showNotice(
        'Bạn đủ điều kiện để tự uống thuốc. Đề nghị liên hệ nhân viên y tế để được hướng dẫn cụ thể.',
      );
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loadingForm}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Vui lòng đợi trong giây lát</Text>
        </View>
      );
    }
    return (
      <View style={styles.wrapper}>
        <Overlay
          height="auto"
          isVisible={this.state.showOverlay}
          overlayBackgroundColor="transparent"
          overlayStyle={{elevation: 0, shadowOpacity: 0}}
          style={styles.overlay}>
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeaderText}>Thông báo</Text>
            <Text style={styles.overlayContentText}>
              {this.state.contentOverlay}
            </Text>
            <View style={styles.overlayLineHorizonal} />
            <View style={styles.overlayRowDirection}>
              <TouchableOpacity
                style={styles.overlayButtonOnlyOne}
                onPress={() => {
                  this.setState({
                    showOverlay: false,
                  });
                }}>
                <Text style={styles.overlayText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>
        <View style={styles.titleForm}>
          <Text style={styles.titleText}>
            Dưới đây là kết quả sàng lọc của bạn. Xin vui lòng kiểm tra lại.
          </Text>
        </View>
        <FlatList
          style={{height: normalHeight(380)}}
          keyExtractor={(item, index1) => index1.toString()}
          data={this.state.questions}
          renderItem={({item, index}) => {
            let idQuestion = index;
            let answerRoot =
              this.state.answers[index] === undefined
                ? false
                : this.state.answers[index];
            let resultRoot;
            if (answerRoot) {
              resultRoot = <Text style={styles.answerYes}>Có</Text>;
            } else {
              resultRoot = <Text style={styles.answerNo}>Không</Text>;
            }
            return (
              <View>
                <Text
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    marginVertical: 5,
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}>
                  {index + 1}. {item.quest}
                </Text>
                {item.ids.length === 0 ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flex: 3, marginVertical: 5}} />
                    <View style={{flex: 1}}>{resultRoot}</View>
                  </View>
                ) : (
                  <FlatList
                    style={{width: '100%'}}
                    data={item.ids}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={this.SubFlatListItemSeparator}
                    renderItem={({item, index}) => {
                      let answerChild =
                        this.state.answers[idQuestion] === undefined ||
                        this.state.answers[idQuestion][index] === undefined
                          ? false
                          : this.state.answers[idQuestion][index];
                      let resultChild;
                      if (answerChild) {
                        resultChild = <Text style={styles.answerYes}>Có</Text>;
                      } else {
                        resultChild = (
                          <Text style={styles.answerNo}>Không</Text>
                        );
                      }
                      return (
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              index % 2 !== 0 ? '#fff' : '#F2F2F2',
                          }}>
                          <View style={{flex: 3, marginVertical: 5}}>
                            <Text style={styles.subQuestionTitle}>
                              {index + 1}. {item.quest}
                            </Text>
                          </View>
                          <View style={{flex: 1}}>{resultChild}</View>
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            );
          }}
        />
        <View style={styles.formBtn}>
          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Button
              icon={
                <Icon
                  name="arrow-left"
                  color="#ffffff"
                  size={moderateScale(16)}
                  style={{marginRight: moderateScale(5)}}
                />
              }
              titleStyle={styles.fontBtn}
              buttonStyle={styles.activeBtn}
              title="Quay lại"
              onPress={this.backQuestion}
            />
            <Button
              icon={
                <Icon
                  name="reply-all"
                  color="#ffffff"
                  size={moderateScale(16)}
                  style={{marginRight: moderateScale(5)}}
                />
              }
              disabled={!this.state.allowRetry}
              disabledStyle={styles.disableBtn}
              disabledTitleStyle={{color: '#fff'}}
              titleStyle={styles.fontBtn}
              buttonStyle={styles.activeBtn}
              title="Làm lại"
              onPress={this.resetQuestion}
            />
            <Button
              disabled={!this.state.allowSave}
              disabledStyle={styles.disableBtn}
              disabledTitleStyle={{color: '#fff'}}
              titleStyle={styles.fontBtn}
              buttonStyle={styles.saveBtn}
              title="Lưu kết quả"
              onPress={() => {
                this.setState(
                  {
                    isLoading: true,
                  },
                  () => this.saveQuestion(),
                );
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  filterRegimen: state.filterRegimen,
  regimenPatientInfo: state.regimenPatientInfo,
});

export default connect(
  mapStateToProps,
  actions,
)(FilterResult);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  //loading
  loadingForm: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    marginVertical: moderateScale(10),
    color: '#2C7770',
  },
  //question
  questionForm: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: moderateScale(5),
    marginLeft: moderateScale(10),
    marginRight: moderateScale(10),
  },
  mainQuestionTitle: {
    marginVertical: moderateScale(5),
    marginHorizontal: moderateScale(10),
    fontSize: moderateScale(18),
  },
  subQuestionTitle: {
    textAlign: 'left',
    alignSelf: 'stretch',
    fontSize: moderateScale(16),
    paddingLeft: moderateScale(10),
  },
  checkboxContent: {
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  //title
  titleForm: {
    backgroundColor: '#F2CD5C',
  },
  titleText: {
    textAlign: 'justify',
    fontSize: moderateScale(18),
    marginHorizontal: moderateScale(10),
  },
  //style for overlay
  overlay: {
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
  },
  overlayContainer: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: moderateScale(5),
  },
  overlayHeaderText: {
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    margin: moderateScale(5),
    fontWeight: 'bold',
  },
  overlayContentText: {
    fontWeight: '500',
    color: '#000000',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    margin: moderateScale(5),
  },
  overlayButtonOnlyOne: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: moderateScale(5),
    flex: 1,
  },
  overlayButton: {
    textAlign: 'justify',
    alignSelf: 'center',
    margin: moderateScale(5),
    flex: 0.5,
  },
  overlayTextNormal: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    fontWeight: 'normal',
  },
  overlayText: {
    color: '#2f59a7',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  overlayLineHorizonal: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    flex: 1,
    opacity: 0.2,
  },
  overlayLineVertical: {
    borderLeftWidth: 1,
    borderLeftColor: 'black',
    opacity: 0.2,
  },
  overlayRowDirection: {
    flexDirection: 'row',
    alignContent: 'space-around',
  },
  //button
  fontBtn: {
    fontSize: moderateScale(16),
  },
  formBtn: {
    flex: 1,
    marginVertical: normalHeight(5),
    justifyContent: 'flex-end',
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  groupBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#F25C5C',
    width: normalWidth(125),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  headerFlatlist: {
    marginTop: -5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {
    backgroundColor: '#03A678',
    width: normalWidth(90),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  disableBtn: {
    backgroundColor: 'gray',
  },
  //checkbox
  formCbx: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  groupCbx: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(5),
  },
  textCbx: {
    width: moderateScale(200),
    fontSize: moderateScale(18),
  },
  //
  answerNo: {
    fontSize: moderateScale(16),
    alignSelf: 'center',
    color: '#2089dc',
    fontWeight: 'bold',
  },
  answerYes: {
    fontSize: moderateScale(16),
    alignSelf: 'center',
    color: '#F25C5C',
    fontWeight: 'bold',
  },
});
