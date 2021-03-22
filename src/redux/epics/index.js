import {combineEpics} from 'redux-observable';
import {counterEpic} from './counterEpic';
import {
  loginUserEpic,
  changeUserEpic,
  userUpdateEpic,
  addUserEpic,
  queryUserEpic,
  insertException,
  loginUserDemoEpic,
  addUserDemoEpic,
} from './userEpic';
import {filterRegimenEpic} from './filterRegimenEpic';
import {regimenPatientEpic} from './regimenPatientEpic';
import {fetchRegimenEpic} from './regimenEpic';
import {
  fetchPostEpic,
  fetchPostByCategoryEpic,
  fetchPostByTagEpic,
} from './postEpic';
import {fetchCategoryEpic, fetchCategoryChildEpic} from './categoryEpic';
import {fetchEndoscopicProcedureEpic} from './endoscopicProcedureEpic';
import {qualityOfTreatmentEpic} from './qualityOfTreatmentEpic';
import {fetchNoticeEpic} from './noticeEpic';

export default combineEpics(
  insertException,
  counterEpic,
  loginUserEpic,
  queryUserEpic,
  addUserEpic,
  loginUserDemoEpic,
  addUserDemoEpic,
  changeUserEpic,
  userUpdateEpic,
  fetchCategoryEpic,
  fetchCategoryChildEpic,
  filterRegimenEpic,
  regimenPatientEpic,
  fetchRegimenEpic,
  fetchPostEpic,
  fetchPostByCategoryEpic,
  fetchPostByTagEpic,
  fetchEndoscopicProcedureEpic,
  qualityOfTreatmentEpic,
  fetchNoticeEpic,
);
