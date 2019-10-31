import {applyMiddleware, combineReducers, createStore, compose} from 'redux'
//import {createLogger} from 'redux-logger'
import user from './user/userReducer'
import chat from './chat/chatReducer'
import game from './game/gameReducer'
import notify from './notify/notifyReducer'
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export default createStore(
    combineReducers({
        user,
        chat,
        game,
        notify,
    }),
    {},
    composeEnhancers(applyMiddleware(/*createLogger()*/)),
)