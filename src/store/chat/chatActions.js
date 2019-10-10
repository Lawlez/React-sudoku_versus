export function setUserActivity(activity) {
	return{
		type:'SET_USER_ACTIVITY',
		payload: activity
	}
}

export function setChatHistory(history) {
	return{
		type:'SET_CHAT_HISTORY',
		payload: history
	}
}

export function setChatMessage(message) {
	return{
		type:'SET_CHAT_MESSAGE',
		payload: message
	}
}

