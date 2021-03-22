import {
  FETCH_POSTS,
  FETCH_POSTS_FULFILLED,
  FETCH_POSTS_BY_CATEGORY,
  FETCH_POSTS_BY_CATEGORY_RESPONSE,
  FETCH_POSTS_BY_TAGS,
  FETCH_POSTS_BY_TAG_FULFILLED,
  FETCH_POSTS_BY_CATEGORY_ERROR,
} from '../actions/type';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_POSTS:
      return {
        ...state,
        postsInfo: action.payload,
        loading: true,
        error: false,
      };
    case FETCH_POSTS_FULFILLED:
      return {
        ...state,
        postsInfo: action.payload,
        loading: false,
        error: false,
        message: 'Success',
      };
    case FETCH_POSTS_BY_CATEGORY:
      return {
        ...state,
        postsInfo: action.payload,
        loading: true,
      };
    case FETCH_POSTS_BY_CATEGORY_RESPONSE:
      // console.log(
      //   'Call action ' + action.type + JSON.stringify(action.payload),
      // );
      return {
        ...state,
        postsInfo: action.payload,
        loading: false,
      };
    case FETCH_POSTS_BY_TAGS:
      return {
        ...state,
        postsInfo: action.payload,
        loading: true,
        error: false,
      };
    case FETCH_POSTS_BY_TAG_FULFILLED:
      return {
        ...state,
        postsInfo: action.payload,
        loading: false,
        error: false,
        message: 'Success',
      };
    case FETCH_POSTS_BY_CATEGORY_ERROR:
      return {
        ...state,
        loading: false,
        error: true,
        message: action.payload,
      };
    default:
      return state;
  }
}
