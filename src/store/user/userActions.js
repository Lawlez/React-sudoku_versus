export function setTempName(name) {
	return{
		type:'SET_TEMP_NAME',
		payload: name
	}
}

export function setUserName(name) {
	return{
		type:'SET_USER_NAME',
		payload: name
	}
}

export function setLoggedIn(login) {
	return{
		type:'SET_LOGGED_IN',
		payload: login
	}
}

export function setPlayerN(number) {
	return{
		type:'SET_PLAYER_N',
		payload: number
	}
}