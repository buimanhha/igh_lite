import {
  ENDOSCOPIC_PROCEDURE_FETCH,
  ENDOSCOPIC_PROCEDURE_FETCH_ERROR,
} from '../actions/type';

import {fetchEndoscopicProcedureFulfilled} from '../actions/index';

import {Observable, from, of} from 'rxjs';
import {mergeMap, delay, mapTo, map, catchError} from 'rxjs/operators';
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
export const fetchEndoscopicProcedureEpic = action$ =>
  action$.pipe(
    ofType(ENDOSCOPIC_PROCEDURE_FETCH),
    mergeMap(action =>
      ajax.getJSON(api_end_point + `endoscopicprocedures`, headers).pipe(
        map(response => fetchEndoscopicProcedureFulfilled(response)),
        catchError(error =>
          of({
            type: ENDOSCOPIC_PROCEDURE_FETCH_ERROR,
            payload: JSON.stringify(error),
          }),
        ),
      ),
    ),
  );
