import {
  FETCH_QUALITY_OF_TREATMENTS,
  FETCH_QUALITY_OF_TREATMENTS_FULFILLED,
} from '../actions/type';

export default function(state = {}, action) {
  // console.log(
  //   'Call action ' + action.type + ' in ' + JSON.stringify(action.payload),
  // );

  switch (action.type) {
    case FETCH_QUALITY_OF_TREATMENTS_FULFILLED:
      // console.log('qualityTreatmentInfo:' + JSON.stringify(action.payload));
      return {
        ...state,
        qualityTreatmentInfo: action.payload,
      };
    default:
      return state;
  }
}
