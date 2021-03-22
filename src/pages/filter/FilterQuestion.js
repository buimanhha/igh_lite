import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as Progress from 'react-native-progress';
import {CheckBox, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';
import * as actions from '../../redux/actions';
import {connect} from 'react-redux';
import * as Constants from '../../global/constants';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

let count = 0;
let question = undefined;
let questions = [];
let allowSave = false;
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

class FilterQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allowRetry: this.props.allowRetry,
      contentOverlay: '',
      showOverlay: false,
      currentQuestion: 1,
      totalQuestion: 1,
      answers: [],
      edit: true,
      isLoading: true,
      hasError: false,
    };
  }

  changeResult = (index, value) => {
    if (!this.state.edit) {
      return;
    }
    let answers = this.state.answers;
    answers[index] = value;
    this.setState({
      answers: answers,
    });
  };

  changeSubResut = (parent, child, value) => {
    if (!this.state.edit) {
      return;
    }
    let answers = this.state.answers;
    if (answers[parent] == null || answers[parent] === undefined) {
      answers[parent] = [];
    }
    allowSave = true;
    answers[parent][child] = value;
    this.setState({
      answers: answers,
    });
  };

  showNotice = content => {
    this.setState({
      showOverlay: true,
      contentOverlay: content,
    });
  };

  backQuestion = () => {
    count--;
    question = questions[count];
    this.setState({
      currentQuestion: count + 1,
    });
  };

  nextQuestion = async () => {
    let resultQuestion = this.state.answers[count];
    if (question.ids.length === 0) {
      if (resultQuestion === undefined || resultQuestion == null) {
        this.setState({
          showOverlay: true,
          contentOverlay: 'Vui lòng đánh dấu đầy đủ các câu hỏi !',
        });
        return;
      }
    } else {
      if (
        resultQuestion == null ||
        resultQuestion === undefined ||
        resultQuestion.length !== question.ids.length
      ) {
        this.setState({
          showOverlay: true,
          contentOverlay: 'Vui lòng đánh dấu đầy đủ các câu hỏi !',
        });
        return;
      } else {
        for (let index = 0; index < resultQuestion.length; index++) {
          if (
            resultQuestion[index] == null ||
            resultQuestion[index] === undefined
          ) {
            this.setState({
              showOverlay: true,
              contentOverlay: 'Vui lòng đánh dấu đầy đủ các câu hỏi !',
            });
            return;
          }
        }
      }
    }
    count++;
    if (count === this.state.totalQuestion) {
      Actions.filterResult({
        allowRetry: this.state.allowRetry,
        allowSave: allowSave,
        answers: this.state.answers,
        questions: questions,
        type: 'reset',
      });
    } else {
      question = questions[count];
      this.setState({
        currentQuestion: count + 1,
      });
    }
  };

  cancelQuestion = () => {
    Actions.home();
  };

  separatorFlatList = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#dedfe0',
        }}
      />
    );
  };

  async componentDidMount() {
    count = this.props.count;
    questions = this.props.questions;
    let edit = this.props.edit;
    edit = edit == null || edit == undefined ? true : edit;
    let answers = this.props.answers;
    if (
      answers == null ||
      answers == undefined ||
      Object.keys(answers).length == 0 ||
      questions == null ||
      questions == undefined ||
      Object.keys(questions).length == 0
    ) {
      questions = [];
      await this.setState(
        {
          edit: edit,
          isLoading: true,
        },
        () => this.props.fetchFilterRegimen(),
      );
    } else {
      if (count == null || count === undefined) {
        count = 0;
      }
      question = questions[count];
      this.setState({
        edit: edit,
        isLoading: false,
        answers: answers,
        totalQuestion: questions.length,
        currentQuestion: count + 1,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (Actions.currentScene === 'filterQuestion') {
      if (
        this.props.filterRegimen !== undefined &&
        prevProps.filterRegimen !== undefined &&
        this.props.filterRegimen.loading !== undefined &&
        prevProps.filterRegimen.loading !== undefined &&
        this.props.filterRegimen.error !== undefined &&
        this.props.filterRegimen.loading !== prevProps.filterRegimen.loading
      ) {
        let size = 0;
        let fullQuestions = this.props.filterRegimen.quests;
        if (fullQuestions !== null && fullQuestions !== undefined) {
          let userInfo = this.props.userInfo.userInfo;
          //Lay cau hoi chinh va loc theo gioi tinh
          fullQuestions.forEach((element, index) => {
            if (element.parentId == null || element.parentId === undefined) {
              if (
                element.gender === Constants.GENDER_ALL ||
                element.gender === userInfo.gender
              ) {
                let subQuestions = element.ids;
                if (
                  subQuestions !== null &&
                  subQuestions !== undefined &&
                  subQuestions.length > 0
                ) {
                  let child = 0;
                  let filterQuestions = [];
                  subQuestions.forEach((elementChild, indexChild) => {
                    if (
                      elementChild.gender === Constants.GENDER_ALL ||
                      elementChild.gender === userInfo.gender
                    ) {
                      filterQuestions[child] = elementChild;
                      child++;
                    }
                  });
                  filterQuestions.sort((a, b) => (a.index > b.index ? 1 : -1));
                  element.ids = filterQuestions;
                }
                questions[size] = element;
                size++;
              }
            }
          });
          count = 0;
          questions.sort((a, b) => (a.index > b.index ? 1 : -1));
          question = questions[count];
          this.setState({
            currentQuestion: count + 1,
            totalQuestion: size,
            isLoading: false,
          });
        }
      }
    }
  }

  render() {
    return this.state.isLoading ? (
      <View style={styles.loadingForm}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Vui lòng đợi trong giây lát</Text>
      </View>
    ) : (
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
        <View style={styles.questionForm}>
          <Text
            style={{
              fontSize: moderateScale(20),
              fontWeight: 'bold',
            }}>
            CÂU HỎI
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              position: 'absolute',
              top: moderateScale(5),
              right: 0,
            }}>
            <Text
              style={{
                marginRight: moderateScale(10),
                fontSize: moderateScale(18),
                fontWeight: 'bold',
              }}>
              {this.state.currentQuestion}/{this.state.totalQuestion}
            </Text>
            <Progress.Bar
              borderRadius={5}
              progress={(count + 1) / this.state.totalQuestion}
              width={moderateScale(100)}
              height={moderateScale(25)}
              color="#03A678"
              animationType="timing"
            />
          </View>
        </View>
        <View>
          <Text style={styles.mainQuestionTitle}>{question.quest}</Text>
          {question.ids.length === 0 ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <View>
                <CheckBox
                  center
                  size={moderateScale(20)}
                  title="Có"
                  checkedIcon="check"
                  uncheckedIcon="circle-o"
                  checkedColor="#F25C5C"
                  textStyle={styles.checkboxLabel}
                  containerStyle={styles.checkboxContent}
                  checked={
                    this.state.answers[count] === undefined
                      ? false
                      : this.state.answers[count]
                  }
                  onPress={() => this.changeResult(count, true)}
                />
              </View>
              <View>
                <CheckBox
                  center
                  size={moderateScale(20)}
                  title="Không"
                  checkedIcon="times"
                  uncheckedIcon="circle-o"
                  checkedColor="#2089dc"
                  textStyle={styles.checkboxLabel}
                  containerStyle={styles.checkboxContent}
                  checked={
                    this.state.answers[count] === undefined
                      ? false
                      : !this.state.answers[count]
                  }
                  onPress={() => this.changeResult(count, false)}
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.headerFlatlist}>
                <View style={{width: moderateScale(225)}} />
                <View
                  style={{
                    width: moderateScale(45),
                  }}>
                  <Text style={styles.checkboxLabel}>Có</Text>
                </View>
                <View
                  style={{
                    width: moderateScale(70),
                  }}>
                  <Text style={styles.checkboxLabel}>Không</Text>
                </View>
              </View>
              <FlatList
                data={question.ids}
                style={{height: normalHeight(360)}}
                keyExtractor={item => item.id.toString()}
                ItemSeparatorComponent={this.separatorFlatList}
                renderItem={({item, index}) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: index % 2 !== 0 ? '#fff' : '#F2F2F2',
                      }}>
                      <View style={{width: moderateScale(225)}}>
                        <Text style={styles.subQuestionTitle}>
                          {index + 1}. {item.quest}
                        </Text>
                      </View>
                      <View style={{width: moderateScale(45)}}>
                        <CheckBox
                          center
                          size={moderateScale(20)}
                          checkedIcon="check"
                          uncheckedIcon="circle-o"
                          checkedColor="#F25C5C"
                          containerStyle={styles.checkboxContent}
                          checked={
                            this.state.answers[count] === undefined
                              ? false
                              : this.state.answers[count][index] === undefined
                              ? false
                              : this.state.answers[count][index]
                          }
                          onPress={() =>
                            this.changeSubResut(count, index, true)
                          }
                        />
                      </View>
                      <View style={{width: moderateScale(70)}}>
                        <CheckBox
                          center
                          size={moderateScale(20)}
                          checkedIcon="times"
                          uncheckedIcon="circle-o"
                          checkedColor="#2089dc"
                          containerStyle={styles.checkboxContent}
                          checked={
                            this.state.answers[count] === undefined
                              ? false
                              : this.state.answers[count][index] === undefined
                              ? false
                              : !this.state.answers[count][index]
                          }
                          onPress={() =>
                            this.changeSubResut(count, index, false)
                          }
                        />
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>
        <View style={styles.formBtn}>
          <View style={styles.groupBtn}>
            <Button
              titleStyle={styles.fontBtn}
              buttonStyle={styles.stopBtn}
              title="Dừng sàng lọc"
              onPress={this.cancelQuestion}
            />
            <Button
              icon={
                <Icon
                  name="arrow-left"
                  color="#ffffff"
                  size={moderateScale(16)}
                  style={{marginRight: moderateScale(5)}}
                />
              }
              disabled={count === 0}
              titleStyle={styles.fontBtn}
              buttonStyle={styles.activeBtn}
              disabledStyle={styles.disableBtn}
              disabledTitleStyle={{color: '#fff'}}
              title="Quay lại"
              onPress={this.backQuestion}
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
              titleStyle={styles.fontBtn}
              buttonStyle={styles.activeBtn}
              title="Tiếp tục"
              onPress={this.nextQuestion}
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
)(FilterQuestion);

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
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  stopBtn: {
    backgroundColor: '#F25C5C',
    width: normalWidth(125),
    borderRadius: 5,
    marginHorizontal: normalWidth(2),
  },
  headerFlatlist: {
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
    color: '#fff',
  },
});
