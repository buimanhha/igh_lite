import {FETCH_NOTICE, FETCH_NOTICE_RESPONSE} from '../actions/type';
import {fetchNoticeRespone} from '../actions';
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
export const fetchNoticeEpic = action$ =>
  action$.pipe(
    ofType(FETCH_NOTICE),
    mergeMap(action =>
      ajax
        .getJSON(api_end_point + `notifyglobals`, headers)
        .pipe(map(response => fetchNoticeRespone(response))),
    ),
  );
