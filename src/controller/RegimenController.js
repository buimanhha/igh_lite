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
import {api_end_point, backend_end_point, backend_auth_key} from '../GlobalCfg';

const requestGetConfig = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'auth-key': backend_auth_key,
  },
};

const requestPutConfig = {
  method: 'PUT', // Method itself
  headers: {
    'Content-type': 'application/json; charset=UTF-8', // Indicates the content
    'auth-key': backend_auth_key,
  },
};

const requestPostConfig = {
  method: 'POST', // Method itself
  headers: {
    'Content-type': 'application/json; charset=UTF-8', // Indicates the content
    'auth-key': backend_auth_key,
  },
};

export async function getRegimen(regimenId) {
  try {
    return fetch(api_end_point + 'regimen?id=' + regimenId, requestGetConfig);
  } catch (err) {
    if (__DEV__) {
      console.log('Error getRegimen|' + err);
    }
    return null;
  }
}

export async function getRegimenInfo(regimenId) {
  try {
    let response = await fetch(
      api_end_point + 'regimen?id=' + regimenId,
      requestGetConfig,
    );
    response = await response.json();
    return response[0];
  } catch (err) {
    if (__DEV__) {
      console.log('Error getRegimenInfo|' + err);
    }
    return null;
  }
}

export async function createRegimenPatient(regimenPatient) {
  try {
    return fetch(
      backend_end_point + 'regimen_of_patient/' + regimenPatient.patient_id,
      {...requestPostConfig, body: JSON.stringify(regimenPatient)},
    ).then(response => response.json());
  } catch (err) {
    if (__DEV__) {
      console.log('Error createRegimenPatient|' + err);
    }
    return null;
  }
}
