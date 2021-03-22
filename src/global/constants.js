import {Dimensions} from 'react-native';

export const GAP = 10;
export const WINDOW_HEIGHT = Dimensions.get('window').height;
export const WINDOW_WIDTH = Dimensions.get('window').width;

//state user
export const PATIENT_PRE_FILTER = 1;
export const PATIENT_STATE_IDLE = 2;
export const PATIENT_STATE_READY_ACTIVE = 3;
export const PATIENT_STATE_ACTIVE = 4;
export const PATIENT_STATE_ACTIVE_SUSPEND = 41;
export const PATIENT_STATE_WAIT_FOR_TIME_MORNING = 42;
export const PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE = 43;
export const PATIENT_STATE_CONFIRM = 5;
//HaBM: Trạng thái sos khi chờ xác nhận độ sạch
export const PATIENT_STATE_CONFIRM_SUSPEND = 51;
//HaBM: Trạng thái vượt quá số lần xác nhận độ sạch ko đạt
export const PATIENT_STATE_CONFIRM_NOT_CLEAN = 52;
export const PATIENT_STATE_AFTER_CONFIRM = 6;
export const PATIENT_STATE_POST_SUPPORT = 7;
export const PATIENT_STATE_POST_SUPPORT_NOT_ENOUGH_CONDITION = 8;
export const PATIENT_AFTER_FILTER_NOT_ALLOW_REGIMEN = 11;
// export const PATIENT_AFTER_FILTER_ALLOW_REGIMEN = 11;

//gender of user
export const GENDER_WOMEN = 0;
export const GENDER_MEN = 1;
export const GENDER_ALL = 2;
