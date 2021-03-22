import {FETCH_REGIMEN, FETCH_REGIMEN_FAIL} from '../actions/type';

import {fetchRegimenFulfilled} from '../actions/index';
import {mergeMap, delay, mapTo, map, catchError} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {Observable, from, of} from 'rxjs';

import {api_end_point, backend_auth_key} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};
export const fetchRegimenEpic = action$ =>
  action$.pipe(
    ofType(FETCH_REGIMEN),
    mergeMap(action =>
      ajax
        .getJSON(api_end_point + 'regimen?id=' + action.payload, headers)
        .pipe(
          map(response => fetchRegimenFulfilled(response)),
          catchError(error =>
            of({
              type: FETCH_REGIMEN_FAIL,
              payload: JSON.stringify(error),
            }),
          ),
        ),
    ),
  );
