import { combineReducers, applyMiddleware, createStore, compose } from 'redux';
import * as Reducers from './app/Reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './app/Sagas/rootSaga';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const reducer = combineReducers(Reducers);
const sagaMiddleware = createSagaMiddleware();

const middleware = [
    sagaMiddleware,
];

const store = createStore(
    reducer,
    {},
    composeEnhancers(
        applyMiddleware(
            ...middleware
        )
    )
);

sagaMiddleware.run(rootSaga);


/**
 * Warning! This is for _DEBUGGING_ purposes only. It should not be used to interact with the store in the codebase
 * under any circumstances.
 */
if(window && !window.store) {
    window.store = store;
}

export default store;
