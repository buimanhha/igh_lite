import {combineReducers} from 'redux';
import counterReducer from './counterReducer';
import userReducer from './userReducer';
import filterRegimenReducer from './filterRegimenReducer';
import regimenReducer from './regimenReducer';
import regimenPatientReducer from './regimenPatientReducer';
import postReducer from './postReducer';
import noticeReducer from './noticeReducer';
import categoryReducer from './categoryReducer';
import endoscopicProcedureReducer from './endoscopicProcedureReducer';
import qualityOfTreatmentReducer from './qualityOfTreatmentReducer';

export default combineReducers({
  counter: counterReducer,
  userInfo: userReducer,
  filterRegimen: filterRegimenReducer,
  regimenInfo: regimenReducer,
  regimenPatientInfo: regimenPatientReducer,
  postsInfo: postReducer,
  noticeInfo: noticeReducer,
  categoryInfo: categoryReducer,
  endoscopicInfo: endoscopicProcedureReducer,
  qualityTreatmentInfo: qualityOfTreatmentReducer,
});
