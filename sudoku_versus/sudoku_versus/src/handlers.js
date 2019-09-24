//handlers
import {client} from './index'
export const handleUserNameInput = (e, setTempName, tempName) => {
	setTempName(e) //////needs function
}
////// login ///////
export const onSubmit = (
	playerNumber,
	tempName,
	allPlayers,
	setPlayerNumber
) => {
	let playerN = playerNumber
console.log(playerN)
	if ((playerN === '') & (allPlayers < 1)) {
		playerN = Number(1)
	} else if ((playerN === '') & (allPlayers < 2)) {
		playerN = Number(2)
	}
	if ((playerN !== undefined) & (playerN !== '')) {
		sendMessage(tempName,playerN,'userevent')
		setPlayerNumber(playerN) //////needs function
		return
	}
	console.log('player not set')
}

export const sendMessage = (userName, playerNumber, type, msg, input,position) => {
	console.log('i sent player', playerNumber)
	let json = {
		username: userName,
		player: playerNumber,
		type: type,
		msg: msg,
		input: input,
		inputPos: position
		}
	console.log(json)
	client.send(JSON.stringify(json))
}
///// game move //////
export const handleUserInput = (input, position, userName, playerNumber) => {
	sendMessage(userName, playerNumber, 'gamemove','',input, position)
}

export const handleChatMessage = (msg, userName, playerNumber) => {
	console.log(msg)
	sendMessage(userName,playerNumber, 'chat',msg)
}

///// Game Functions /////
export const resetGame = (userName, playerNumber) => {
	sendMessage(userName,playerNumber,'resetgame')
}

export const endGame = (userName, playerNumber, fieldInput) => {
	console.log('TODO end game function')
	if (Object.keys(fieldInput).length < 5) {
		console.log('fill the board first bro')
		return
	}
	sendMessage(userName, Number(playerNumber),'endgame')
}
///////// ATTACK function////////
export const launchAttack = (userName, playerNumber) => {
	sendMessage(userName,Number(playerNumber),'attack')
}
export const deleteValue = (cell, userName, playerNumber) => {
	sendMessage(userName,playerNumber,'gamemove','','',cell)
}