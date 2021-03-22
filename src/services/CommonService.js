//Địa điểm nghiên cứu
const Hopital = 1;
const Clinic = 2;
const NotFoundLocation = -1;
//Phác đồ nghiên cứu [3 gói fortran]
export let DefaultRegimen = 18;
export let RegexActiveCode = /^([a-b]|[A-B])[0-9]{3}$/;

export function isNullOrEmptyStr(input) {
  return isNull(input) || input.trim() == '' || input.trim().length == 0;
}

export function isNull(input) {
  return typeof input == 'undefined' || input == null;
}

export function getLocationFromCode(input) {
  let activeCode = new String(input);
  let letter = activeCode.charAt(0);
  if (isNullOrEmptyStr(letter)) {
    if (__DEV__) {
      console.log(
        'GetLocationFromCode|Not found first letter from active code = ' +
          input,
      );
    }
    return NotFoundLocation;
  }
  switch (letter) {
    case 'A':
    case 'a':
      return Hopital;
    case 'B':
    case 'b':
      return Clinic;
    default:
      if (__DEV__) {
        console.log('GetLocationFromCode|Not found location for = ' + letter);
      }
      return NotFoundLocation;
  }
}
