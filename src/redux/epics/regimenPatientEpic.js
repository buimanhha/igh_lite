import {
  DB_UPDATE_REGIMEN_PATIENT,
  DB_UPDATE_REGIMEN_PATIENT_RESPONSE,
  FETCH_REGIMEN_PATIENT,
  FETCH_REGIMEN_PATIENT_FAIL,
  FETCH_REGIMEN_PATIENT_FULFILLED,
} from '../actions/type';

import {
  fetchResultDBUpdateRegimenPatient,
  fetchRegimenPatientFulfilled,
} from '../actions/index';

import {mergeMap, delay, mapTo, map, catchError} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {Observable, from, of} from 'rxjs';

import {backend_end_point, backend_auth_key} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};
//done fix to api get filterRegimen
export const regimenPatientEpic = action$ =>
  action$.pipe(
    ofType(DB_UPDATE_REGIMEN_PATIENT),
    mergeMap(async action => {
      var patientId = action.payload.patient_id;
      console.log(
        'Call put' + (backend_end_point + 'regimen_of_patient/' + patientId),
      );
      var requestPutConfig = {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': 'mk7sadjoi234s238a9fd',
        },
        body: JSON.stringify(action.payload),
      };
      const url = backend_end_point + 'regimen_of_patient/' + patientId;
      const response = await fetch(url, requestPutConfig).then(res =>
        res.json(),
      );
      return Object.assign({}, action, {
        type: '' + DB_UPDATE_REGIMEN_PATIENT_RESPONSE,
        response,
      });
    }),
  );

export const fetchRegimenPatientEpic = action$ =>
  action$.pipe(
    ofType(FETCH_REGIMEN_PATIENT),
    mergeMap(action =>
      ajax
        .getJSON(
          backend_end_point + 'regimen_of_patient/' + action.payload,
          headers,
        )
        .pipe(
          map(response => fetchRegimenPatientFulfilled(response)),
          catchError(error =>
            of({
              type: FETCH_REGIMEN_PATIENT_FAIL,
              payload: JSON.stringify(error),
            }),
          ),
        ),
    ),
  );
