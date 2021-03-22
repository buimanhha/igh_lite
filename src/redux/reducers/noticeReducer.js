import {FETCH_NOTICE, FETCH_NOTICE_RESPONSE} from '../actions/type';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_NOTICE:
      return {
        ...state,
        loading: true,
        noticeInfo: action.payload,
      };
    case FETCH_NOTICE_RESPONSE:
      return {
        ...state,
        loading: false,
        noticeInfo: action.payload,
      };
    default:
      return state;
  }
}
