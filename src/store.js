import {applyMiddleware, combineReducers, createStore, compose} from 'redux'
import {createLogger} from 'redux-logger'
import user from './store/user/userReducer'
import chat from './store/chat/chatReducer'
import game from './store/game/gameReducer'
import notify from './store/notify/notifyReducer'
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export default createStore(
	combineReducers({
		user,
		chat,
		game,
		notify,
	}),
	{},
	composeEnhancers(applyMiddleware(createLogger())),
)