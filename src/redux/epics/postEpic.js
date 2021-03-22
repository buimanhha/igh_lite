import {
  FETCH_POSTS,
  FETCH_POSTS_BY_CATEGORY,
  FETCH_POSTS_BY_TAGS,
  FETCH_POSTS_FULFILLED,
  FETCH_POSTS_BY_CATEGORY_RESPONSE,
  FETCH_POSTS_BY_CATEGORY_ERROR,
} from '../actions/type';

import {
  fetchPostsFulfilled,
  fetchPostsByCategoryResponse,
} from '../actions/index';
import {mergeMap, delay, mapTo, map, catchError} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {Observable, from, of} from 'rxjs';

import {
  api_end_point,
  backend_end_point,
  backend_auth_key,
} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};
//done need try catch here, if not, when crash, this not listen again
export const fetchPostEpic = action$ =>
  action$.pipe(
    ofType(FETCH_POSTS),
    mergeMap(action =>
      ajax
        .getJSON(api_end_point + 'posts?type=' + action.payload, headers)
        .pipe(
          map(response => fetchPostsFulfilled(response)),
          catchError(error =>
            of({
              type: FETCH_POSTS_BY_CATEGORY_ERROR,
              payload: JSON.stringify(error),
              error: true,
            }),
          ),
        ),
    ),
  );

export const fetchPostByCategoryEpic = action$ =>
  action$.pipe(
    ofType(FETCH_POSTS_BY_CATEGORY),
    mergeMap(action =>
      ajax
        .getJSON(
          api_end_point +
            'posts?type=' +
            action.payload.type +
            '&categoryId=' +
            action.payload.categoryId,
        )
        .pipe(
          map(response => fetchPostsByCategoryResponse(response)),
          catchError(error =>
            of({
              type: FETCH_POSTS_BY_CATEGORY_ERROR,
              payload: JSON.stringify(error),
              error: true,
            }),
          ),
        ),
    ),
  );

//done need try catch here, if not, when crash, this not listen again
export const fetchPostByTagEpic = action$ =>
  action$.pipe(
    ofType(FETCH_POSTS_BY_TAGS),
    mergeMap(action =>
      ajax.getJSON(api_end_point + 'posts?' + action.payload).pipe(
        map(response => fetchPostsFulfilled(response)),
        catchError(error =>
          of({
            type: FETCH_POSTS_BY_CATEGORY_ERROR,
            payload: JSON.stringify(error),
            error: true,
          }),
        ),
      ),
    ),
  );
