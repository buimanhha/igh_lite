import {
  FETCH_FILTER_REGIMEN,
  FETCH_FILTER_REGIMEN_FULFILLED,
} from '../actions/type';

import {fetchFilterRegimenFulfilled} from '../actions/index';
import {Observable} from 'rxjs';
import {mergeMap, delay, mapTo, map} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {
  api_end_point,
  backend_end_point,
  backend_auth_key,
} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};
//TODO fix to api get filterRegimen
export const filterRegimenEpic = action$ =>
  action$.pipe(
    ofType(FETCH_FILTER_REGIMEN),
    mergeMap(action =>
      ajax
        .getJSON(api_end_point + `filterforregimen`, headers)
        .pipe(map(response => fetchFilterRegimenFulfilled(response))),
    ),
  );
