import {
  CLEAR_ALL_PROPS,
  FETCH_USER,
  QUERY_USER,
  QUERY_USER_FAIL,
  QUERY_USER_RESPONSE,
  ADD_USER,
  ADD_USER_FAIL,
  ADD_USER_RESPONSE,
  UPDATE_USER,
  UPDATE_USER_FAIL,
  UPDATE_USER_RESPONSE,
  CLEAN_USER_CACHE,
  FETCH_USER_ERROR,
  FETCH_USER_FAIL,
  FETCH_USER_RESPONSE,
  FETCH_USER_FULFILLED,
  CANCEL_FETCHING_USER,
  EXIST_USER_FAIL,
  EXIST_USER_RESPONSE,
  USER_CACHE_CHOICE_AFTER_REGIMEN,
  USER_CACHE_CHOICE_AFTER_REGIMEN_RESPONSE,
  STORE_USER,
  //lite
  FETCH_USER_DEMO,
  FETCH_USER_DEMO_ERROR,
  FETCH_USER_DEMO_FAIL,
  FETCH_USER_DEMO_RESPONSE,
  ADD_USER_DEMO,
  ADD_USER_DEMO_FAIL,
  ADD_USER_DEMO_RESPONSE,
} from '../actions/type';
import actions from 'redux-form/lib/actions';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_USER_DEMO:
      return {
        ...state,
        loading: true,
        error: undefined,
      };
    case FETCH_USER:
      return {
        ...state,
        loading: true,
        error: undefined,
      };
    case FETCH_USER_FULFILLED:
      return {
        ...state,
        userInfo: action.payload[0],
      };
    case FETCH_USER_RESPONSE:
      return {
        ...state,
        loading: false,
        error: 0,
        userInfo: action.response[0],
      };
    case FETCH_USER_DEMO_RESPONSE:
      return {
        ...state,
        loading: false,
        error: 0,
        userInfo: action.response[0],
      };
    case FETCH_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: 1,
      };
    case FETCH_USER_DEMO_FAIL:
      return {
        ...state,
        loading: false,
        error: 1,
      };
    case FETCH_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: 2,
      };
    case FETCH_USER_DEMO_ERROR:
      return {
        ...state,
        loading: false,
        error: 2,
      };
    case UPDATE_USER:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        loading: true,
        error: undefined,
        userInfo: action.payload,
      };
    case UPDATE_USER_RESPONSE:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        loading: false,
        error: 0,
        userInfo: action.payload,
      };
    case UPDATE_USER_FAIL:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        loading: false,
        error: 1,
      };
    case STORE_USER:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
      };
    case USER_CACHE_CHOICE_AFTER_REGIMEN:
      return {
        ...state,
        userInfo: action.payload,
      };
    case USER_CACHE_CHOICE_AFTER_REGIMEN_RESPONSE:
      return {
        ...state,
        result: action.payload,
      };
    case CLEAN_USER_CACHE:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        userInfo: undefined,
      };
    case CLEAR_ALL_PROPS:
      return {
        ...state,
        userInfo: undefined,
      };
    case EXIST_USER_FAIL:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        loading: false,
        errorCheckUser: -1,
      };
    case EXIST_USER_RESPONSE:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        loading: false,
        errorCheckUser: 1,
      };
    case ADD_USER:
      return {
        ...state,
        loading: true,
      };
    case ADD_USER_DEMO:
      return {
        ...state,
        loading: true,
      };
    case ADD_USER_FAIL:
      return {
        ...state,
        loading: false,
        errorCheckUser: -1,
      };
    case ADD_USER_DEMO_FAIL:
      return {
        ...state,
        loading: false,
        errorCheckUser: -1,
      };
    case ADD_USER_RESPONSE:
      return {
        ...state,
        loading: false,
        errorCheckUser: 0,
        patientId: action.patientId,
        userInfo: action.response[0],
      };
    case ADD_USER_DEMO_RESPONSE:
      return {
        ...state,
        loading: false,
        errorCheckUser: 0,
        patientId: action.patientId,
        userInfo: action.response[0],
      };
    case QUERY_USER:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action),
      // );
      return {
        ...state,
        loading: true,
        error: undefined,
      };
    case QUERY_USER_RESPONSE:
      // console.log(
      //   'UserReducer = ' + action.type + ' | ' + JSON.stringify(action),
      // );
      return {
        ...state,
        loading: false,
        error: 0,
        userInfo: action.payload[0],
      };
    case QUERY_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: 1,
      };
    default:
      return state;
  }
}
