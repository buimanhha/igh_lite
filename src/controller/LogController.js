import {api_end_point, backend_end_point, backend_auth_key} from '../GlobalCfg';

const requestGetConfig = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
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

export async function putException(exception) {
  try {
    console.log(JSON.stringify(exception));
    return fetch(backend_end_point + 'exception', {
      ...requestPostConfig,
      body: JSON.stringify(exception),
    });
  } catch (err) {
    console.log(err);
  }
}
