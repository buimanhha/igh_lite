import {createStore, applyMiddleware} from 'redux';
import reducers from '../reducers';
import {createEpicMiddleware} from 'redux-observable';
import rootEpic from '../epics';
// import {composeWithDevTools} from 'redux-devtools-extension';

const epicMiddleware = createEpicMiddleware();

const store = createStore(
  reducers,
  applyMiddleware(epicMiddleware),
  //   {},
  //   composeWithDevTools(),
);

epicMiddleware.run(rootEpic);

export default store;
