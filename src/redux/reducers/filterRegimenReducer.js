import {
  CLEAR_ALL_PROPS,
  FETCH_FILTER_REGIMEN,
  FETCH_FILTER_REGIMEN_FULFILLED,
  UPDATE_FILTER_REGIMEN_ANSWER,
} from '../actions/type';

export default function(state = {}, action) {
  // console.log(
  //   'Call action ' + action.type + ' in ' + JSON.stringify(action.payload),
  // );

  switch (action.type) {
    case FETCH_FILTER_REGIMEN:
      return {
        ...state,
        loading: true,
        quests: action.payload,
      };
    case FETCH_FILTER_REGIMEN_FULFILLED:
      return {
        ...state,
        loading: false,
        error: 0,
        quests: action.payload,
      };
    case UPDATE_FILTER_REGIMEN_ANSWER:
      return {
        ...state,
        answer: action.payload,
      };
    case CLEAR_ALL_PROPS:
      return {
        ...state,
        answer: undefined,
      };
    default:
      return state;
  }
}
