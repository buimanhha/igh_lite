import {
  FETCH_CATEGORY,
  FETCH_CATEGORY_RESPONSE,
  FETCH_CATEGORY_CHILD,
  FETCH_CATEGORY_CHILD_RESPONSE,
} from '../actions/type';

export default function(state = {}, action) {
  // console.log(
  //     'Category reducer ' + action.type + ' | ' + JSON.stringify(action.payload),
  // );
  switch (action.type) {
    case FETCH_CATEGORY:
      return {
        ...state,
        categoryInfo: action.payload,
        loading: true,
      };
    case FETCH_CATEGORY_RESPONSE:
      return {
        ...state,
        categoryInfo: action.payload,
        loading: false,
      };
    case FETCH_CATEGORY_CHILD:
      return {
        ...state,
        categoryInfo: action.payload,
        loading: true,
      };
    case FETCH_CATEGORY_CHILD_RESPONSE:
      return {
        ...state,
        categoryInfo: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}
