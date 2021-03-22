// import {saveUser, deleteUser} from '../../redux/actions/UserActions';
// import MyGlobal from '../MyGlobal';

/**
 * if you have an instance of Strapi running on your local
 * machine:
 *
 * 1. Run `adb reverse tcp:8163 tcp:8163` (only on android)
 *
 * 2. You have to change the access IP from localhost
 * to the IP of the machine Strapi is running on.
 */

import { api_end_point, backend_end_point, backend_auth_key } from '../GlobalCfg';

const requestGetConfig = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'auth-key': backend_auth_key,
  },
};

const requestPutConfig = {
  method: 'PUT',
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
    'auth-key': backend_auth_key,
  },
};

export async function getRegimenPatient(patientId) {
  try {
    return fetch(
      backend_end_point + 'regimen_of_patient/' + patientId,
      requestGetConfig,
    );
  } catch (err) {
    if (__DEV__) {
      console.log(err);
    }
    return null;
  }
}

export async function getPatientById(patientId) {
  try {
    return fetch(backend_end_point + 'patient/' + patientId, requestGetConfig)
      .then(response => response.json())
      .then(responseJson => {
        return responseJson[0];
      });
  } catch (err) {
    if (__DEV__) {
      console.log(err);
    }
  }
  return null;
}

export async function getRegimenPatientById(patientId) {
  try {
    return fetch(
      backend_end_point + 'regimen_of_patient/' + patientId,
      requestGetConfig,
    ).then(response => response.json());
  } catch (err) {
    if (__DEV__) {
      console.log(err);
    }
  }
  return null;
}

export async function updateRegimenPatient(patientId, regimentPatient) {
  try {
    return fetch(backend_end_point + 'regimen_of_patient/' + patientId, {
      ...requestPutConfig,
      body: JSON.stringify(regimentPatient),
    });
  } catch (err) {
    if (__DEV__) {
      console.log(err);
    }
    return null;
  }
}

export async function updateRegimenPatientFields(patientRegimenId, params) {
  try {
    return fetch(
      backend_end_point + 'regimen_of_patient/fields/' + patientRegimenId,
      {
        ...requestPutConfig,
        body: JSON.stringify(params),
      },
    );
  } catch (err) {
    if (__DEV__) {
      console.log(err);
    }
    return null;
  }
}

export async function updateRegimenPatientFields_2(patientRegimenId, params) {
  try {
    return fetch(
      backend_end_point + 'regimen_of_patient/fields_2/' + patientRegimenId,
      {
        ...requestPutConfig,
        body: JSON.stringify(params),
      },
    );
  } catch (err) {
    if (__DEV__) {
      console.log(err);
    }
    return null;
  }
}

export function safeParseJSON(json) {
  let jsonData = null;
  try {
    jsonData = JSON.parse(json);
  } catch (e) {
    if (__DEV__) {
      console.log('ERROR|Exception parse json|Data=' + json);
    }
  }
  return jsonData;
}
