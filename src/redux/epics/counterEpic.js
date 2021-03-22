import {INCREASE, INCREASE_DONE} from '../actions/type';
import {Observable} from 'rxjs';
import {mergeMap, delay, mapTo} from 'rxjs/operators';
import {ofType} from 'redux-observable';

export const counterEpic = action$ =>
  action$.pipe(
    ofType(INCREASE),
    delay(1000), // Asynchronously wait 1000ms then continue
    mapTo({type: INCREASE_DONE}),
  );
