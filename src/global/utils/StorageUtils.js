import AsyncStorage from '@react-native-community/async-storage';

//Async AsyncStorage
export async function storeData(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
    console.log('Store ' + key + ':' + JSON.stringify(value));
  } catch (e) {
    // saving error
    alert(e);
  }
}

export async function getData(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // value previously stored
      console.log('Get value for ' + key + ':' + JSON.stringify(value));
    } else {
      console.log('Get value for ' + key + ':' + JSON.stringify(value));
    }
    return value;
  } catch (e) {
    // error reading value
    alert(e);
  }
}

export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
    console.log('Remove value for key:' + key);
  } catch (e) {
    // error reading value
    alert(e);
  }
}

export async function getJsonData(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    // console.log('Get Jsonvalue for ' + key + ':' + value);
    return JSON.parse(value);
  } catch (e) {
    // error reading value
    alert(e);
  }
}

export async function storeJsonData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    // console.log('Store Json ' + key + ' value:' + JSON.stringify(value));
  } catch (e) {
    // saving error
    alert(e);
  }
}

export async function clearAll() {
  try {
    await AsyncStorage.clear();
    // console.log('Clear all data');
  } catch (e) {
    // saving error
    alert(e);
  }
}
