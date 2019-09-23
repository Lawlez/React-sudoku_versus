//handlers
import {client} from './index'
export const handleUserNameInput = (e, setTempName, tempName) => {
	setTempName(e)							//////needs function
	console.log(e)
	console.log('before submit tempoName: ', tempName)
}
////// login ///////
export const onSubmit = (playerNumber,tempName,allPlayers,setPlayerNumber) => {
	let playerN = playerNumber
	console.log('onsubmit tempName: ', tempName)
	if ((playerN === '') & (allPlayers < 1)) {
		console.log('assign P1')
		playerN = Number(1)
	} else if ((playerN === '') & (allPlayers < 2)) {
		console.log('assign P2')
		playerN = Number(2)
	}
	if ((playerN !== undefined) & (playerN !== '')) {
		sendMessage({
			username: tempName,
			type: 'userevent',
			player: playerN
		})
		console.log('before send', playerN)
		setPlayerNumber(playerN)			//////needs function
		return
	}
	console.log(playerNumber)
	console.log('player not set')
}

export const sendMessage = (json) => {
	client.send(JSON.stringify(json))
}
///// game move //////
export const handleUserInput = (input, position, userName, playerNumber) => {
	sendMessage({
		username: userName,
		player: Number(playerNumber),
		type: 'gamemove',
		input: input,
		inputPos: position
	})
}

export const handleChatMessage = (msg, userName, playerNumber) => {
	console.log(msg)
	sendMessage({
		username: userName,
		player: Number(playerNumber),
		type: 'chat',
		msg: msg
	})
}

///// Game Functions /////
export const resetGame = (userName, playerNumber) => {
	sendMessage({
		username: userName,
		player: Number(playerNumber),
		type: 'resetgame'
	})
}

export const endGame = (userName, playerNumber, fieldInput) => {
	console.log('TODO end game function')
	if (Object.keys(fieldInput).length < 30) {
		console.log('fill the board first bro')
		return
	}
	sendMessage({
		username: userName,
		player: Number(playerNumber),
		type: 'endgame'
	})
}
///////// ATTACK function////////
export const launchAttack = (userName, playerNumber) => {
	sendMessage({
		username: userName,
		player: Number(playerNumber),
		type: 'attack'
	})
}
////// end Game Functions /////
export const deleteValue = (cell, userName, playerNumber) => {
	sendMessage({
		username: userName,
		player: Number(playerNumber),
		type: 'gamemove',
		input: '',
		inputPos: cell
	})
}