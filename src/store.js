import {applyMiddleware, combineReducers, createStore, compose} from 'redux'
import {createLogger} from 'redux-logger'
import user from './store/user/userReducer'
import chat from './store/chat/chatReducer'
import game from './store/game/gameReducer'
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export default createStore(
	combineReducers({
		user,
		chat,
		game,
	}),
	{},
	composeEnhancers(applyMiddleware(createLogger())),
)