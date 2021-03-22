import { api_end_point, backend_end_point, backend_auth_key } from '../GlobalCfg';

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

export async function getPosts() {
  try {
    return fetch(api_end_point + 'posts?type=1', requestGetConfig)
      .then(response => response.json())
      .then(responseJson => {
        responseJson = responseJson.filter(
          item => item.contentHtml == null || item.contentHtml == '',
        );
        return responseJson;
      });
  } catch (err) {
    if (__DEV__) {
      console.log(JSON.stringify(err));
    }
    return null;
  }
}
