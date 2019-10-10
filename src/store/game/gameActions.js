export function setGameMove(move) {
	return{
		type:'SET_GAME_MOVE',
		payload: move
	}
}
export function setOpponentMove(move) {
	return{
		type:'SET_OPPONENT_MOVE',
		payload: move
	}
}
export function setAllPlayers(players) {
	return{
		type:'SET_ALL_PLAYERS',
		payload: players
	}
}
export function setGameTime(time) {
	return{
		type:'SET_GAME_TIME',
		payload: time
	}
}
export function setBoard(board) {
	return{
		type:'SET_BOARD',
		payload: board
	}
}
export function setCooldown(cooldown) {
	return{
		type:'SET_COOLDOWN',
		payload: cooldown
	}
}
export function setShake(shake) {
	return{
		type:'SET_SHAKE',
		payload: shake
	}
}
export function setMemes(memes) {
	return{
		type:'SET_MEMES',
		payload: memes
	}
}
export function setReady(ready) {
	return{
		type:'SET_READY',
		payload: ready
	}
}