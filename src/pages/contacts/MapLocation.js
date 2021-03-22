import React, {Component} from 'react';
import {Dimensions, StyleSheet, Platform, Alert} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {Actions} from 'react-native-router-flux';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import * as Log from '../../controller/LogController';
import * as StorageUtils from '../../global/utils/StorageUtils';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 21.010941;
const LONGITUDE = 105.836971;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyBy2AFWhWKGA_B_yBdweODQa52tQSpJF-c';

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

export default class MapLocation extends Component {
  constructor(props) {
    super(props);

    // AirBnB's Office, and Apple Park
    this.state = {
      endPosition: {
        latitude: 21.00862,
        longitude: 105.838622,
      },
      coordinates: [
        {
          latitude: 21.00862,
          longitude: 105.838622,
        },
      ],
    };

    this.mapView = null;
  }

  onMapPress = e => {
    // this.setState({
    //   coordinates: [...this.state.coordinates, e.nativeEvent.coordinate],
    // });
  };

  async componentDidMount() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (!granted) {
        const askGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'AppNoiSoi',
            message: 'Cần cấp quyền truy cập vị trí để chỉ đường',
          },
        );
        if (askGranted != PermissionsAndroid.RESULTS.GRANTED) {
          alert('Cần cấp quyền truy cập vị trí');
          return;
        }
      }
    }
    Geolocation.getCurrentPosition(
      position => {
        console.log('position:' + JSON.stringify(position));
        this.setState({
          coordinates: [position.coords, this.state.endPosition],
        });
      },
      error => {
        console.log(error.message);
        this.setState({
          coordinates: [
            {
              latitude: 21.010941,
              longitude: 105.836971,
            },
            this.state.endPosition,
          ],
        });
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }

  render() {
    return (
      <MapView
        initialRegion={{
          latitude: LATITUDE,
          longitude: LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        style={StyleSheet.absoluteFill}
        ref={c => (this.mapView = c)}
        onPress={this.onMapPress}>
        {this.state.coordinates.map((coordinate, index) => (
          <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} />
        ))}
        {this.state.coordinates.length >= 2 && (
          <MapViewDirections
            origin={this.state.coordinates[0]}
            waypoints={
              this.state.coordinates.length > 2
                ? this.state.coordinates.slice(1, -1)
                : []
            }
            destination={
              this.state.coordinates[this.state.coordinates.length - 1]
            }
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="hotpink"
            optimizeWaypoints={true}
            onStart={params => {
              console.log(
                `Started routing between "${params.origin}" and "${
                  params.destination
                }"`,
              );
            }}
            onReady={result => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min.`);

              this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: width / 20,
                  bottom: height / 20,
                  left: width / 20,
                  top: height / 20,
                },
              });
            }}
            onError={errorMessage => {
              console.log('GOT AN ERROR ' + errorMessage);
            }}
          />
        )}
      </MapView>
    );
  }
}
