import {
  ENDOSCOPIC_PROCEDURE_FETCH,
  ENDOSCOPIC_PROCEDURE_FETCH_ERROR,
  ENDOSCOPIC_PROCEDURE_FETCH_FULFILLED,
  CLEAR_ALL_PROPS,
} from '../actions/type';

export default function(state = {}, action) {
  switch (action.type) {
    case ENDOSCOPIC_PROCEDURE_FETCH:
      return {
        ...state,
        loading: true,
        error: 0,
        endoscopicInfo: action.payload,
      };
    case ENDOSCOPIC_PROCEDURE_FETCH_FULFILLED:
      return {
        ...state,
        loading: false,
        error: 0,
        endoscopicInfo: action.payload,
      };
    case ENDOSCOPIC_PROCEDURE_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: 1,
        endoscopicInfo: {},
      };
    case CLEAR_ALL_PROPS:
      return {
        ...state,
        endoscopicInfo: {},
      };
    default:
      return state;
  }
}
