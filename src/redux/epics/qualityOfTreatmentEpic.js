import {
  FETCH_QUALITY_OF_TREATMENTS,
  FETCH_QUALITY_OF_TREATMENTS_FULFILLED,
} from '../actions/type';

import {fetchQualityOfTreatmentsFulfilled} from '../actions/index';
import {Observable} from 'rxjs';
import {mergeMap, delay, mapTo, map} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {api_end_point, backend_auth_key} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};
//TODO fix to api get filterRegimen
export const qualityOfTreatmentEpic = action$ =>
  action$.pipe(
    ofType(FETCH_QUALITY_OF_TREATMENTS),
    mergeMap(action =>
      ajax
        .getJSON(api_end_point + 'qualityoftreatments', headers)
        .pipe(map(response => fetchQualityOfTreatmentsFulfilled(response))),
    ),
  );
