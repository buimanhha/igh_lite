import React, {Component} from 'react';
import {View, StyleSheet, Text, TextInput} from 'react-native';
import {Actions, Router, Stack, Scene} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
//account
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/account/Account';
import ChangePwd from './pages/account/ChangePassword';
import ForgotPwd from './pages/account/ForgotPassword';
//filter
import Filter from './pages/filter/Filter';
import FilterQuestion from './pages/filter/FilterQuestion';
import FilterResult from './pages/filter/FilterResult';
//service
import Service from './pages/service/Service';
//regimen
import ActiveRegimen from './pages/monitor/ActiveRegimen';
import ConfirmFinishRegimen from './pages/monitor/ConfirmFinishRegimen';
// import StateRegimen from './pages/monitor/StateRegimen';
import DetailRegimen from './pages/monitor/DetailRegimen';
import PreActiveRegimen from './pages/monitor/PreActiveRegimen';
import ConfirmFinalRegimen from './pages/monitor/ConfirmFinalRegimen';
//contact
import Contact from './pages/contacts/Contact';
//news
import CategoryChild from './pages/infos/CategoryChild';
import Category from './pages/infos/Category';
import News from './pages/infos/News';
import Infomation from './pages/infos/Infomation';
import Posts from './pages/infos/Posts';
import Notices from './pages/infos/Notices';
import MapLocation from './pages/contacts/MapLocation';
//Apointment
import Appointment from './pages/appointment/Appointment';
//PostSupport
import PostSupportWithTag from './pages/postSupport/PostSupportWithTag';
import PrePostSupport from './pages/postSupport/PrePostSupport';
import PostSupport from './pages/postSupport/PostSupport';
import ViewCalender from './pages/postSupport/ViewCalender';
import GuidePostSupport from './pages/postSupport/GuidePostSupport';
import AlertRegimenNotActive from './pages/monitor/AlertRegimenNotActive';
import ResultRegimen from './pages/monitor/ResultRegimen';
//web statistic view
// import StatisticHtml from './pages/infos/StatisticHtml';
import store from './redux/stores';
import * as Constants from './global/constants';
import * as PatientController from './controller/PatientController';
import * as NotifyUtils from './global/utils/NotifyUtils';
//import RNNotificationService from '../RNNotificationService';
const activeColor = '#2C7770';
const inactiveColor = '#666666';
const activeSize = 3;

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

// Icon.loadFont();

export default class Routes extends Component {
  HomesTab = props => {
    let borderColor = props.focused ? activeColor : '#FFFFFF';
    let color = props.focused ? activeColor : inactiveColor;
    let size = props.focused ? activeSize : 0;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopColor: borderColor,
          borderTopWidth: size,
          padding: 20,
        }}>
        <Icon name="home" style={styles.iconTab} color={color} size={24} />
      </View>
    );
  };
  AccountTab = props => {
    let borderColor = props.focused ? activeColor : '#FFFFFF';
    let color = props.focused ? activeColor : inactiveColor;
    let size = props.focused ? activeSize : 0;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          borderTopColor: borderColor,
          borderTopWidth: size,
          padding: 20,
        }}>
        <Icon name="user" style={styles.iconTab} color={color} size={24} />
      </View>
    );
  };
  render() {
    return (
      <Router
        navBarTintColor={{color: '#fff'}}
        navigationBarStyle={{backgroundColor: '#2C7770', color: '#fff'}}
        barButtonIconStyle={styles.barButtonIconStyle}
        titleStyle={{color: '#fff'}}
        tintColor="#fff">
        <Scene>
          <Scene
            key="root"
            activeTintColor="#2C7770"
            tabs={true}
            hideNavBar={true}>
            <Scene
              initial={true}
              icon={this.HomesTab}
              key="home"
              component={Home}
              title="Trang ch???"
              hideNavBar={true}
            />
            <Scene
              key="user"
              icon={this.AccountTab}
              title="T??i kho???n"
              hideNavBar={false}>
              <Scene
                key="login"
                component={Login}
                title="????ng nh???p"
                hideNavBar={false}
                back={true}
                onBack={() => Actions.root({type: 'reset'})}
              />
              <Scene
                key="account"
                component={Account}
                title="T??i kho???n"
                hideNavBar={false}
                back={true}
                onBack={() => Actions.root({type: 'reset'})}
              />
              <Scene
                key="signup"
                component={Signup}
                title="????ng k??"
                hideNavBar={false}
                back={true}
                onBack={() => Actions.root({type: 'reset'})}
              />
              <Scene
                key="changePwd"
                component={ChangePwd}
                title="?????i m???t kh???u"
                hideNavBar={false}
              />
              <Scene
                key="forgotPwd"
                component={ForgotPwd}
                title="Qu??n m???t kh???u"
                hideNavBar={false}
              />
            </Scene>
          </Scene>
          <Scene
            key="filter"
            component={Filter}
            title="S??ng l???c"
            hideNavBar={false}
            back={true}
            onBack={() => Actions.root({type: 'reset'})}
          />
          <Scene
            key="filterQuestion"
            component={FilterQuestion}
            title="S??ng l???c"
            hideNavBar={false}
            back={true}
            onBack={() => Actions.root({type: 'reset'})}
          />
          <Scene
            key="filterResult"
            component={FilterResult}
            title="S??ng l???c"
            hideNavBar={false}
            back={true}
            onBack={() => Actions.root({type: 'reset'})}
          />
          <Scene
            key="serviceDetail"
            component={Service}
            title="G??i d???ch v???"
            hideNavBar={false}
          />
          <Scene
            key="activeRegimen"
            component={ActiveRegimen}
            title="C??c b?????c chu???n b???"
            hideNavBar={false}
            onBack={() => {
              Actions.home();
            }}
            back={true}
          />
          <Scene
            key="finishRegimen"
            component={ConfirmFinishRegimen}
            title="K???t th??c l??? tr??nh"
            hideNavBar={false}
            onBack={() => {
              Actions.home();
            }}
            back={true}
          />
          <Scene
            key="mapLocation"
            component={MapLocation}
            title="?????a ch???"
            hideNavBar={false}
          />
          <Scene
            key="newsAndVideo"
            component={News}
            title="C???p nh???t ki???n th???c"
            hideNavBar={false}
          />
          <Scene
            key="infomation"
            component={Infomation}
            title="Th??ng tin b??i vi???t"
            hideNavBar={false}
          />
          <Scene
            key="appointment"
            component={Appointment}
            title="?????t l???ch kh??m"
            hideNavBar={false}
          />
          <Scene
            key="PreActiveRegimen"
            component={PreActiveRegimen}
            title="?????a ??i???m u???ng thu???c"
            hideNavBar={false}
          />
          <Scene
            icon={this.RegimenTab}
            key="DetailRegimen"
            component={DetailRegimen}
            title="Chi ti???t qu?? tr??nh"
            hideNavBar={false}
          />
          <Scene
            key="category"
            component={Category}
            title="Chuy??n m???c"
            hideNavBar={false}
          />
          <Scene
            key="categoryChild"
            component={CategoryChild}
            title="Chi ti???t chuy??n m???c"
            hideNavBar={false}
          />
          <Scene
            key="Posts"
            component={Posts}
            title="B??i vi???t"
            hideNavBar={false}
          />
          <Scene
            key="prePostSupport"
            component={PrePostSupport}
            title="H??? tr??? sau n???i soi"
            hideNavBar={false}
            onBack={() => {
              Actions.home();
            }}
            back={true}
          />
          <Scene
            key="postSupport"
            component={PostSupport}
            title="H??? tr??? sau n???i soi"
            hideNavBar={false}
            onBack={() => {
              Actions.home();
            }}
            back={true}
          />
          <Scene
            key="postSupportWithTag"
            component={PostSupportWithTag}
            title="H?????ng d???n chi ti???t"
            hideNavBar={false}
          />
          <Scene
            key="viewCalendar"
            component={ViewCalender}
            title="L???ch"
            hideNavBar={false}
          />
          <Scene
            key="guidePostSupport"
            component={GuidePostSupport}
            title="B??i vi???t h?????ng d???n"
            hideNavBar={false}
          />
          <Scene
            key="alertRegimenNotActive"
            component={AlertRegimenNotActive}
            title="K??ch Ho???t Ph??c ????? U???ng Thu???c"
            hideNavBar={false}
          />
          <Scene
            key="confirmFinalRegimen"
            component={ConfirmFinalRegimen}
            title="X??c nh???n th??ng tin"
            hideNavBar={false}
            onBack={() => {
              Actions.home();
            }}
            back={true}
          />
          <Scene
            key="resultRegimen"
            component={ResultRegimen}
            title="Th??ng tin sau ph??c ?????"
            hideNavBar={false}
            onBack={() => {
              Actions.home();
            }}
            back={true}
          />
        </Scene>
      </Router>
    );
  }
}

const styles = StyleSheet.create({
  barButtonIconStyle: {
    tintColor: 'white',
  },
  container: {
    flex: 1,
  },
  icon: {
    paddingLeft: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: 120,
  },
  iconTab: {
    width: 25,
    height: 25,
  },
});
