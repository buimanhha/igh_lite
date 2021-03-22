import * as type from './type';

//user
export const fetchUser = payload => ({
  type: type.FETCH_USER,
  payload,
});
export const fetchUserFulFilled = payload => ({
  type: type.FETCH_USER_FULFILLED,
  payload,
});
export const fetchUserFail = payload => ({
  type: type.FETCH_USER_FAIL,
  payload,
});
export const fetchUserResponse = payload => ({
  type: type.FETCH_USER_RESPONSE,
  payload,
});
export const updateUser = payload => ({
  type: type.UPDATE_USER,
  payload,
});
export const updateUserFail = payload => ({
  type: type.UPDATE_USER_FAIL,
  payload,
});
export const updateUserResponse = payload => ({
  type: type.UPDATE_USER_RESPONSE,
  payload,
});
export const queryUser = payload => ({
  type: type.QUERY_USER,
  payload,
});
export const queryUserResponse = payload => ({
  type: type.QUERY_USER_RESPONSE,
  payload,
});
export const addUser = payload => ({
  type: type.ADD_USER,
  payload,
});
export const addUserResponse = payload => ({
  type: type.ADD_USER_RESPONSE,
  payload,
});
//lite
export const fetchUserDemo = payload => ({
  type: type.FETCH_USER_DEMO,
  payload,
});
export const fetchUserDemoFail = payload => ({
  type: type.FETCH_USER_DEMO_FAIL,
  payload,
});
export const fetchUserDemoResponse = payload => ({
  type: type.FETCH_USER_DEMO_RESPONSE,
  payload,
});
export const addUserDemo = payload => ({
  type: type.ADD_USER_DEMO,
  payload,
});
export const addUserDemoResponse = payload => ({
  type: type.ADD_USER_DEMO_RESPONSE,
  payload,
});
//end
export const cleanUserCache = payload => ({
  type: type.CLEAN_USER_CACHE,
  payload,
});
export const cleanUserCacheResponse = payload => ({
  type: type.CLEAN_USER_CACHE_RESPONE,
  payload,
});
export const storeUser = payload => ({
  type: type.STORE_USER,
  payload,
});
export const cancelRequest = () => ({type: type.CANCEL_FETCHING_USER});

export const userCacheChoiceAfterRegimen = payload => ({
  type: type.USER_CACHE_CHOICE_AFTER_REGIMEN,
  payload,
});

//filter regimen
export const fetchFilterRegimen = () => ({type: type.FETCH_FILTER_REGIMEN});
export const fetchFilterRegimenFulfilled = payload => ({
  type: type.FETCH_FILTER_REGIMEN_FULFILLED,
  payload,
});

//
export const updateFilterRegimenAnswer = payload => ({
  type: type.UPDATE_FILTER_REGIMEN_ANSWER,
  payload,
});

//regimen
export const fetchRegimen = payload => ({
  type: type.FETCH_REGIMEN,
  payload: payload,
});
export const fetchRegimenFulfilled = payload => ({
  type: type.FETCH_REGIMEN_FULFILLED,
  payload,
});
export const storeRegimen = payload => ({
  type: type.UPDATE_REGIMEN,
  payload,
});

//regimen patient
export const fetchRegimenPatient = () => ({type: type.FETCH_REGIMEN_PATIENT});
export const fetchRegimenPatientFulfilled = payload => ({
  type: type.FETCH_REGIMEN_PATIENT_FULFILLED,
  payload,
});
export const storeRegimenPatient = payload => ({
  type: type.UPDATE_REGIMEN_PATIENT,
  payload,
});

export const dbUpdateRegimenPatient = payload => ({
  type: type.DB_UPDATE_REGIMEN_PATIENT,
  payload,
});

export const dbCreateRegimenPatient = payload => ({
  type: type.DB_CREATE_REGIMEN_PATIENT,
  payload,
});

export const fetchResultDBUpdateRegimenPatient = payload => ({
  type: type.DB_UPDATE_REGIMEN_PATIENT_RESPONSE,
  payload,
});

//posts
export const fetchCategory = payload => ({
  type: type.FETCH_CATEGORY,
  payload,
});

export const fetchCategoryResponse = payload => ({
  type: type.FETCH_CATEGORY_RESPONSE,
  payload,
});

export const fetchCategoryChild = payload => ({
  type: type.FETCH_CATEGORY_CHILD,
  payload,
});

export const fetchCategoryChildResponse = payload => ({
  type: type.FETCH_CATEGORY_CHILD_RESPONSE,
  payload,
});

export const fetchPostsByCategory = payload => ({
  type: type.FETCH_POSTS_BY_CATEGORY,
  payload,
});

export const fetchPostsByCategoryResponse = payload => ({
  type: type.FETCH_POSTS_BY_CATEGORY_RESPONSE,
  payload,
});

export const fetchPosts = payload => ({
  type: type.FETCH_POSTS,
  payload,
});

export const fetchPostsFulfilled = payload => ({
  type: type.FETCH_POSTS_FULFILLED,
  payload,
});

export const fetchPostsByTag = payload => ({
  type: type.FETCH_POSTS_BY_TAGS,
  payload,
});

export const fetchPostsByTagFulfilled = payload => ({
  type: type.FETCH_POSTS_BY_TAG_FULFILLED,
  payload,
});

//endoscopic procedure
export const fetchEndoscopicProcedure = () => ({
  type: type.ENDOSCOPIC_PROCEDURE_FETCH,
});
export const fetchEndoscopicProcedureFulfilled = payload => ({
  type: type.ENDOSCOPIC_PROCEDURE_FETCH_FULFILLED,
  payload,
});

//quality of treatment
export const fetchQualityOfTreatments = () => ({
  type: type.FETCH_QUALITY_OF_TREATMENTS,
});
export const fetchQualityOfTreatmentsFulfilled = payload => ({
  type: type.FETCH_QUALITY_OF_TREATMENTS_FULFILLED,
  payload,
});

//notice
export const fetchNotice = payload => ({
  type: type.FETCH_NOTICE,
  payload,
});

export const fetchNoticeRespone = payload => ({
  type: type.FETCH_NOTICE_RESPONSE,
  payload,
});

export const clearAllProps = payload => ({
  type: type.CLEAR_ALL_PROPS,
  payload,
});

export const insertException = payload => ({
  type: type.INSERT_EXCEPTION,
  payload,
});
