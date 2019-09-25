import {
	playersReady,
	sendMessage,
	spectators,
	players,
	gameField1,
	gameField2,
	dataFromClient,
	userActivity,
	json,
	clients
} from './server'
////////TIMER FUNCTION///////////
let playTimer = 0
let startTime = null
export const gameTimer = () => {
	//[[[[[[[[>>>works]]]]]]]]
	playTimer = playTimer + 1
	playTimer.toFixed(3)
	console.log(playTimer) ///wait 1 seconds until cleint is rdy to recieve
	sendMessage(JSON.stringify({type: 'time', time: playTimer}))
}
export const startTimer = () => {
	startTime = setInterval(gameTimer, 1000)
}
export const stopTimer = () => {
	clearInterval(startTime)
}
if (playersReady === 2) {
	startTime = setInterval(gameTimer, 1000)
}
if (playersReady <= 2) {
	clearInterval(startTime)
}

/////////////////////////////////

// generates unique userid for everyuser.
export const getUniqueID = () => {
	//[[[[[[[[>>>works]]]]]]]]
	const s4 = () =>
		Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1)
	return s4() + '-' + s4()
}

//// SeNDING RESPONSE TO GAME MOVES ////////
export const sendGameMove = (json, players, spectators) => {
	let i = 0
	console.log(players, spectators)
	console.log('im sending', json)
	for (let player in players) {
		players[player].sendUTF(JSON.stringify(json))
		i++
		console.log(i, 'times')
	}
	/*
		Object.keys(players).map((player) => {
			//console.log('playersend', player)
			players[player].sendUTF(JSON.stringify(json))
		})*/
	json.field = {
		gamefield1: gameField1,
		gamefield2: gameField2
	}

	/*for (let spec in spectators) {
		spectators[spec].sendUTF(JSON.stringify(json))
		i++
		console.log(i, 'times')
	}*/

	Object.keys(spectators).map((spectator) => {
		console.log('spectatorsend', spectators[spectator])
		i++
		console.log(i, 'times')
		spectators[spectator].sendUTF(JSON.stringify(json))
	})
}
//////////////////// attacks /////////////////////
export const attackTypes = {
	//defining attack types
	STROBO: 'stroboscope',
	DELETE: 'delete random entry',
	SHAKE: 'shakes the playfield',
	SWITCH: 'switches playfield values',
	MEME: 'display distracting memes & gifs'
}

//TODO SOLVER & GENERATOR

export const handleAttacks = (dataFromClient) => {
	//[[[[[[[[>>>works]]]]]]]]
	let json1 = json
	const randomAttack = (obj) => {
		let attackKey = Object.keys(obj)
		return obj[attackKey[(attackKey.length * Math.random()) << 0]]
	}

	let currentAttack = randomAttack(attackTypes)
	console.log(currentAttack)

	userActivity.push(
		`${dataFromClient.username} launched an ATTACK: ${currentAttack}`
	)
	json1 = {type: 'attack'}
	json1.data = {
		user: dataFromClient.username,
		player: dataFromClient.player,
		attack: currentAttack,
		userActivity
	}
	console.log(json1)
	sendMessage(JSON.stringify(json1))
}

export const userRegisterHandler = (
	dataFromClient,
	users,
	userID,
	playersReady,
	spectators,
	players
) => {
	//[[[[[[[[>>>works]]]]]]]]
	let json1 = json
	for (let keys in users) {
		if (users[keys] === dataFromClient.username) {
			json1.data = {
				username: 'UsrNameTaken',
				'user-id': userID,
				userActivity
			}
			clients[userID].sendUTF(JSON.stringify(json1)) //only send to client that sent request
			return
		}
	}
	users[userID] = dataFromClient.username
	userActivity.push(
		`${dataFromClient.username} joined the Game as Player ${dataFromClient.player} with UID ${userID}`
	)
	if (dataFromClient.player === 1 || dataFromClient.player === 2) {
		if (dataFromClient.player === 1) {
			players = {...players, player1: clients[userID]}
		} else if (dataFromClient.player === 2) {
			players = {...players, player2: clients[userID]}
		}
		playersReady++
		console.log('playersReady', playersReady)
	}
	let spec = clients[userID]
	if (dataFromClient.player === 'spectator') {
		spectators[userID] = spec
	}
	console.log('spectators: ', spectators)
	json1.data = {
		username: users[userID],
		userid: userID,
		player: dataFromClient.player,
		playersReady: playersReady,
		userActivity
	} //add user +activity to the data of our response
	let msg = {type: 'chat'}
	msg.data = {
		chat: [
			'Server: Hey Players 👋,The game starts when both players joined & you type /start in the chat. Your field is the blue one. To fill in a field simply click it and start typing, players have the option to reset their own field.',
			'Server: Hey Spectators! 🤩 Attacks are selected at random and will be launched at both players & become available after a time delay. '
		]
	}
	console.log(msg)
	sendMessage(JSON.stringify(msg)) //sending game instructions directly to chat
	let output = {
		json: json1.data,
		spectators: spectators,
		players: players,
		activity: userActivity,
		playersrdy: playersReady
	}
	return output
}

export default gameTimer