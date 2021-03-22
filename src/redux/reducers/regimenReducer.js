import {
  CLEAR_ALL_PROPS,
  FETCH_REGIMEN,
  UPDATE_REGIMEN,
  FETCH_REGIMEN_FULFILLED,
  FETCH_REGIMEN_FAIL,
} from '../actions/type';

export default function(state = {}, action) {
  // console.log(
  //   'Call action ' + action.type + ' in regimenReducer ' + JSON.stringify(action.payload),
  // );

  switch (action.type) {
    case FETCH_REGIMEN:
      // console.log("in FETCH_REGIMEN, loading true");
      return {
        ...state,
        regimenInfo: undefined,
        loading: true,
      };
    case FETCH_REGIMEN_FULFILLED:
      //TODO sort response here
      let regimenInfo = action.payload[0];
      if (
        regimenInfo !== undefined &&
        regimenInfo != null &&
        regimenInfo.regimensteps !== undefined &&
        regimenInfo.regimensteps != null
      ) {
        let regimenSteps = regimenInfo.regimensteps;
        regimenSteps.sort((a, b) => (a.index > b.index ? 1 : -1));
        regimenInfo.regimensteps = regimenSteps;
      }
      // console.log("in FETCH_REGIMEN_FULFILLED, loading false");
      //end
      return {
        ...state,
        regimenInfo: regimenInfo,
        loading: false,
      };
    case FETCH_REGIMEN_FAIL:
      // console.log("in FETCH_REGIMEN_FAIL, loading false");
      return {
        ...state,
        regimenInfo: undefined,
        loading: false,
      };
    case UPDATE_REGIMEN:
      return {
        ...state,
        regimenInfo: action.payload[0],
      };
    case CLEAR_ALL_PROPS:
      return {
        ...state,
        regimenInfo: undefined,
      };
    default:
      return state;
  }
}
