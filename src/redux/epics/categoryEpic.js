import {
  FETCH_CATEGORY,
  FETCH_CATEGORY_CHILD,
  FETCH_CATEGORY_CHILD_RESPONSE,
  FETCH_POSTS_BY_CATEGORY_RESPONSE,
} from '../actions/type';
import {
  fetchCategoryResponse,
  fetchCategoryChildResponse,
} from '../actions/index';
import {mergeMap, delay, mapTo, map} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {Observable, from} from 'rxjs';
import {
  api_end_point,
  backend_end_point,
  backend_auth_key,
} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};

export const fetchCategoryEpic = action$ =>
  action$.pipe(
    ofType(FETCH_CATEGORY),
    mergeMap(action =>
      ajax
        .getJSON(
          api_end_point + `categories?parentCategory=0&_sort=order:ASC`,
          headers,
        )
        .pipe(map(response => fetchCategoryResponse(response))),
    ),
  );

export const fetchCategoryChildEpic = action$ =>
  action$.pipe(
    ofType(FETCH_CATEGORY_CHILD),
    mergeMap(async action => {
      let response = [];
      let requestCategoryChild = {
        method: 'GET',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
      };
      let categoryChild = await fetch(
        api_end_point + `categories?parentCategory=` + action.payload,
      ).then(res => res.json());
      if (categoryChild != undefined && categoryChild != null) {
        response[0] = categoryChild;
      }
      let categoryPost = await fetch(
        api_end_point + `posts?type=1&categoryId=` + action.payload,
      ).then(res => res.json());
      if (
        categoryPost != undefined &&
        categoryPost != null &&
        Object.keys(categoryPost).length > 0
      ) {
        response[1] = categoryPost;
      }
      return fetchCategoryChildResponse(response);
    }),
  );
