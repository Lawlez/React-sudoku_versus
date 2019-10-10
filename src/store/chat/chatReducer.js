const chatReducer = (
	state = {
		userActivity: [],
		chatHistory: [],
		chatMessage: '',
	},
	action,
) => {
	switch (action.type) {
		case 'SET_USER_ACTIVITY':
			state = {
				...state,
				userActivity: action.payload,
			}
			break
		case 'SET_CHAT_HISTORY':
			state = {
				...state,
				chatHistory: action.payload,
			}
			break
		case 'SET_CHAT_MESSAGE':
			state = {
				...state,
				chatMessage: action.payload,
			}
			break
		default:
			return state
	}
	return state
}
export default chatReducer