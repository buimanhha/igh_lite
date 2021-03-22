import {
  CLEAR_ALL_PROPS,
  FETCH_REGIMEN_PATIENT,
  UPDATE_REGIMEN_PATIENT,
  DB_UPDATE_REGIMEN_PATIENT,
  DB_UPDATE_REGIMEN_PATIENT_RESPONSE,
  FETCH_REGIMEN_PATIENT_FAIL,
  FETCH_REGIMEN_PATIENT_FULFILLED,
} from '../actions/type';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_REGIMEN_PATIENT:
      return {
        ...state,
        loading: true,
        error: false,
      };
    case FETCH_REGIMEN_PATIENT_FULFILLED:
      return {
        ...state,
        regimenPatientInfo: action.payload,
        loading: false,
        error: false,
      };
    case FETCH_REGIMEN_PATIENT_FAIL:
      return {
        ...state,
        regimenPatientInfo: undefined,
        loading: false,
        error: true,
        msg: action.payload,
      };
    case UPDATE_REGIMEN_PATIENT:
      return {
        ...state,
        regimenPatientInfo: action.payload,
      };
    case DB_UPDATE_REGIMEN_PATIENT:
      return {
        ...state,
        regimenPatientInfo: action.payload,
      };
    case DB_UPDATE_REGIMEN_PATIENT_RESPONSE:
      // console.log(
      //   'Call action ' + action.type + ' in ' + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        response: action.payload,
      };
    case CLEAR_ALL_PROPS:
      return {
        ...state,
        regimenPatientInfo: undefined,
      };
    default:
      return state;
  }
}
