import {mergeMap, delay, mapTo, map, catchError} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {ajax} from 'rxjs/observable/dom/ajax';
import {Observable, from, of} from 'rxjs';
import {
  fetchUserFulFilled,
  fetchUserResponse,
  queryUserResponse,
} from '../actions';
import {
  FETCH_USER,
  FETCH_USER_FAIL,
  FETCH_USER_RESPONSE,
  ADD_USER,
  ADD_USER_FAIL,
  ADD_USER_RESPONSE,
  UPDATE_USER,
  UPDATE_USER_RESPONSE,
  FETCH_USER_FULFILLED,
  CANCEL_FETCHING_USER,
  USER_CACHE_CHOICE_AFTER_REGIMEN,
  USER_CACHE_CHOICE_AFTER_REGIMEN_RESPONSE,
  QUERY_USER,
  QUERY_USER_FAIL,
  EXIST_USER_RESPONSE,
  QUERY_USER_RESPONSE,
  FETCH_USER_ERROR,
  EXIST_USER_FAIL,
  INSERT_EXCEPTION,
  FETCH_USER_DEMO_ERROR,
  FETCH_USER_DEMO,
  FETCH_USER_DEMO_FAIL,
  FETCH_USER_DEMO_RESPONSE,
  ADD_USER_DEMO,
  ADD_USER_DEMO_FAIL,
  ADD_USER_DEMO_RESPONSE,
} from '../actions/type';
import {backend_end_point, backend_auth_key} from '../../GlobalCfg';

const headers = {
  'auth-key': backend_auth_key,
};

export const loginUserEpic = action$ =>
  action$.pipe(
    ofType(FETCH_USER),
    mergeMap(async action => {
      // console.log('loginUserEpic|' + JSON.stringify(action.payload));
      let requestLoginUser = {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify(action.payload),
      };
      const urlLoginUser = backend_end_point + 'patient_login';
      const response = await fetch(urlLoginUser, requestLoginUser).then(res =>
        res.json(),
      );
      // console.log('Response login user|' + JSON.stringify(response));
      // timeout
      if (response == null || response == undefined || response.length == 0) {
        return Object.assign({}, action, {
          type: FETCH_USER_ERROR,
        });
      }
      const userInfo = response[0];
      // check exist
      if (
        userInfo.patient_id != null &&
        userInfo.patient_id != undefined &&
        userInfo.patient_id > 0
      ) {
        return Object.assign({}, action, {
          type: FETCH_USER_RESPONSE,
          response,
        });
      }
      return Object.assign({}, action, {
        type: FETCH_USER_FAIL,
      });
    }),
  );

export const loginUserDemoEpic = action$ =>
  action$.pipe(
    ofType(FETCH_USER_DEMO),
    mergeMap(async action => {
      let requestLoginUser = {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify(action.payload),
      };
      const urlLoginUser = backend_end_point + 'patient_demo';
      const response = await fetch(urlLoginUser, requestLoginUser).then(res =>
        res.json(),
      );
      // timeout
      if (response == null || response == undefined || response.length == 0) {
        return Object.assign({}, action, {
          type: FETCH_USER_DEMO_ERROR,
        });
      }
      const userInfo = response[0];
      // check exist
      if (
        userInfo.patient_id != null &&
        userInfo.patient_id != undefined &&
        userInfo.patient_id > 0
      ) {
        return Object.assign({}, action, {
          type: FETCH_USER_DEMO_RESPONSE,
          response,
        });
      }
      return Object.assign({}, action, {
        type: FETCH_USER_DEMO_FAIL,
      });
    }),
  );

export const queryUserEpic = action$ =>
  action$.pipe(
    ofType(QUERY_USER),
    mergeMap(action =>
      ajax
        .getJSON(
          backend_end_point + 'patient/' + action.payload.patientId,
          headers,
        )
        .pipe(
          map(response => queryUserResponse(response)),
          catchError(error =>
            of({
              type: QUERY_USER_FAIL,
            }),
          ),
        ),
    ),
    // mergeMap(async action => {
    //   console.log('Call put ' + JSON.stringify(action));
    //   let requestQuery = {
    //     method: 'GET',
    //     headers,
    //   };
    //   let patientId = action.payload.patientId;
    //   const urlQueryUser = backend_end_point + '/patient/' + patientId;
    //   const urlQueryRegimenPatient =
    //     backend_end_point + '/regimen_of_patient/' + patientId;
    //   const responseQueryUser = await fetch(
    //     urlQueryUser,
    //     requestPutConfig,
    //   ).then(res => res.json());
    //   console.log('Response user|' + JSON.stringify(responseQueryUser));
    //   if (
    //     responseQueryUser == undefined ||
    //     responseQueryUser == null ||
    //     responseQueryUser.length == 0
    //   ) {
    //     return Object.assign({}, action, {
    //       type: QUERY_USER_FAIL,
    //     });
    //   }
    //   const responseQueryRegimenPatient = await fetch(
    //     urlQueryRegimenPatient,
    //     requestQuery,
    //   ).then(res => res.json());
    //   if (
    //     responseQueryRegimenPatient == undefined ||
    //     responseQueryRegimenPatient == null ||
    //     responseQueryRegimenPatient.length == 0
    //   ) {
    //     return Object.assign({}, action, {
    //       type: QUERY_USER_FAIL,
    //     });
    //   }
    //   let userInfo = responseQueryUser[0];
    //   let regimenPatientInfo = responseQueryRegimenPatient[0];
    //   return Object.assign({}, action, {
    //     type: QUERY_USER_RESPONSE,
    //     userInfo,
    //     regimenPatientInfo,
    //   });
    // }),
  );

export const changeUserEpic = action$ =>
  action$.pipe(
    ofType(UPDATE_USER),
    mergeMap(async action => {
      // console.log('Call put update|' + JSON.stringify(action.payload));
      var requestPutConfig = {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify(action.payload),
      };
      var patientId = action.payload.patient_id;
      const url = backend_end_point + 'patient/' + patientId;
      const response = await fetch(url, requestPutConfig).then(res =>
        res.json(),
      );
      // console.log('Response update|' + JSON.stringify(response));
      return Object.assign({}, action, {
        type: '' + UPDATE_USER_RESPONSE,
        response,
      });
    }),
  );

export const userUpdateEpic = action$ =>
  action$.pipe(
    ofType(USER_CACHE_CHOICE_AFTER_REGIMEN),
    mergeMap(async action => {
      var requestPutConfig = {
        method: 'PUT',
        headers,
        body: JSON.stringify(action.payload),
      };
      const url = backend_end_point + 'patient/' + action.payload.patient_id;
      const response = await fetch(url, requestPutConfig).then(res =>
        res.json(),
      );
      return Object.assign({}, action, {
        type: '' + USER_CACHE_CHOICE_AFTER_REGIMEN_RESPONSE,
        response,
      });
    }),
  );

export const addUserEpic = action$ =>
  action$.pipe(
    ofType(ADD_USER),
    mergeMap(async action => {
      console.log('AddUserEpic|' + JSON.stringify(action.payload));
      // Kiem tra ton tai user
      let requestExistUser = {
        method: 'GET',
        headers,
      };
      const urlExistUser =
        backend_end_point + 'patient_exist/' + action.payload.msisdn;
      const responseExistUser = await fetch(
        urlExistUser,
        requestExistUser,
      ).then(res => res.json());
      console.log('Response exist user|' + JSON.stringify(responseExistUser));
      if (responseExistUser == undefined || responseExistUser == null) {
        return Object.assign({}, action, {
          type: EXIST_USER_FAIL,
        });
      }
      console.log('===>>' + responseExistUser.length);
      if (responseExistUser.length > 0) {
        return Object.assign({}, action, {
          type: EXIST_USER_RESPONSE,
        });
      }
      // Tao user
      let requestAddUser = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify({
          first_name: '',
          last_name: '',
          user_name: action.payload.name,
          telephone: action.payload.msisdn,
          ext_id: '',
          status: 1,
          email: '',
          created_date: new Date(),
          updated_date: new Date(),
          remark: '',
          avatar_img64: '',
          data_content: '',
          date_of_birth: action.payload.birthDay,
          address1: '',
          address2: '',
          address3: '',
          province: '',
          idcard_number: '',
          passwd: action.payload.password,
          gender: action.payload.gender,
        }),
      };
      console.log(JSON.stringify(requestAddUser));
      const urlAddUser = backend_end_point + '/patient';
      const responseAddUser = await fetch(urlAddUser, requestAddUser).then(
        res => res.json(),
      );
      console.log('Response add user|' + JSON.stringify(responseAddUser));
      if (responseAddUser == undefined || responseAddUser == null) {
        return Object.assign({}, action, {
          type: ADD_USER_FAIL,
          responseAddUser,
        });
      }
      let result = responseAddUser.affectedRows;
      let patientId = responseAddUser.insertId;
      if (
        result !== undefined &&
        result > 0 &&
        patientId !== undefined &&
        patientId >= 0
      ) {
        let requestQueryUser = {
          method: 'GET',
          headers,
        };
        const urlQueryUser = backend_end_point + '/patient/' + patientId;
        const response = await fetch(urlQueryUser, requestQueryUser).then(res =>
          res.json(),
        );
        console.log('Response add user|' + JSON.stringify(response));
        return Object.assign({}, action, {
          type: ADD_USER_RESPONSE,
          patientId,
          response,
        });
      }
      return Object.assign({}, action, {
        type: ADD_USER_FAIL,
        responseAddUser,
      });
    }),
  );

export const addUserDemoEpic = action$ =>
  action$.pipe(
    ofType(ADD_USER_DEMO),
    mergeMap(async action => {
      if (__DEV__) {
        console.log('AddUserDemoEpic|' + JSON.stringify(action.payload));
      }
      // Kiem tra ton tai user
      let requestExistUser = {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify(action.payload),
      };
      const urlExistUser = backend_end_point + 'patient_demo';
      if (__DEV__) {
        console.log('Response exist user demo|' + urlExistUser);
      }
      const responseExistUser = await fetch(
        urlExistUser,
        requestExistUser,
      ).then(res => res.json());
      if (__DEV__) {
        console.log('Response exist user|' + JSON.stringify(responseExistUser));
      }
      if (responseExistUser == undefined || responseExistUser == null) {
        return Object.assign({}, action, {
          type: EXIST_USER_FAIL,
        });
      }
      if (responseExistUser.length > 0) {
        return Object.assign({}, action, {
          type: EXIST_USER_RESPONSE,
        });
      }
      // Tao user
      let requestAddUser = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify({
          first_name: '',
          last_name: '',
          user_name: action.payload.name,
          telephone: '',
          ext_id: action.payload.extId,
          status: 1,
          email: '',
          created_date: new Date(),
          updated_date: new Date(),
          remark: '',
          avatar_img64: '',
          data_content: '',
          date_of_birth: action.payload.birthDay,
          address1: '',
          address2: '',
          address3: '',
          province: '',
          idcard_number: '',
          passwd: '',
          gender: action.payload.gender,
        }),
      };
      if (__DEV__) {
        console.log(JSON.stringify(requestAddUser));
      }
      const urlAddUser = backend_end_point + 'patient';
      const responseAddUser = await fetch(urlAddUser, requestAddUser).then(
        res => res.json(),
      );
      if (__DEV__) {
        console.log(
          'Response add user demo|' + JSON.stringify(responseAddUser),
        );
      }
      if (responseAddUser == undefined || responseAddUser == null) {
        return Object.assign({}, action, {
          type: ADD_USER_DEMO_FAIL,
          responseAddUser,
        });
      }
      let result = responseAddUser.affectedRows;
      let patientId = responseAddUser.insertId;
      if (
        result !== undefined &&
        result > 0 &&
        patientId !== undefined &&
        patientId >= 0
      ) {
        let requestQueryUser = {
          method: 'GET',
          headers,
        };
        const urlQueryUser = backend_end_point + 'patient/' + patientId;
        const response = await fetch(urlQueryUser, requestQueryUser).then(res =>
          res.json(),
        );
        if (__DEV__) {
          console.log('Response add user|' + JSON.stringify(response));
        }
        return Object.assign({}, action, {
          type: ADD_USER_DEMO_RESPONSE,
          patientId,
          response,
        });
      }
      return Object.assign({}, action, {
        type: ADD_USER_DEMO_FAIL,
        responseAddUser,
      });
    }),
  );

export const insertException = action$ =>
  action$.pipe(
    ofType(INSERT_EXCEPTION),
    mergeMap(async action => {
      var requestPutConfig = {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'auth-key': backend_auth_key,
        },
        body: JSON.stringify(action.payload),
      };
      const url = backend_end_point + 'exception';
      const response = await fetch(url, requestPutConfig).then(res =>
        res.json(),
      );
    }),
  );
