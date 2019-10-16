import {playersReady, json, webSocket} from './server'
import activityHandler, {userActivity} from './activityHandler'
import {defaultChatMsg, COOLDOWN, attackTypes, HIGHSCORE_FILE} from '../config'
////////TIMER FUNCTION///////////
let playTimer = 0
let startTime = null
const fs = require('fs')
export const gameTimer = () => {
	playTimer = playTimer + 1
	playTimer.toFixed(3)
	webSocket.sendMessage({type: 'time', time: playTimer})
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

// generates unique userid for everyuser.
export const getUniqueID = () => {
	const s4 = () =>
		Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1)
	return s4() + '-' + s4()
}
//////////////////// attacks /////////////////////

let lastAttack = Number(0)
const attackCooldown = () => {
	lastAttack = lastAttack + 33
	console.log('cooldown over ( ͡° ͜ʖ ͡°)')
}
export const handleAttacks = (dataFromClient) => {
	let canAttack
	if (!canAttack) {
		canAttack = setTimeout(attackCooldown, COOLDOWN)
	}
	let json1 = json
	let currentAttack
	if (lastAttack > 30) {
		lastAttack = 0
		clearTimeout(canAttack)
		const randomAttack = (obj) => {
			let attackKey = Object.keys(obj)
			return obj[attackKey[(attackKey.length * Math.random()) << 0]]
		}
		currentAttack = randomAttack(attackTypes)
		if (currentAttack === attackTypes.SWITCH) {
			let p1 = webSocket.getClientByType('player', 1)
			let p2 = webSocket.getClientByType('player', 2)
			let msg = {type: 'gamemove'}
			let p1moves = {...p1.moves}
			let p2moves = {...p2.moves}
			//switching clientside
			for (let i = 1; i < 3; i++) {
				msg.data = {
					player: i,
					gameField: i > 1 ? p1moves : p2moves,
				}
				webSocket.sendMessage(msg)
			}
			console.log('p1', p1moves)
			console.log('p2', p2moves)
			msg.data = {
				gameField1: p2moves,
				gameField2: p1moves,
			}
			webSocket.sendMessage(msg, 'spectator')
			//switching server side
			webSocket.setClients(p1.userid, 'moves', p2moves)
			webSocket.setClients(p2.userid, 'moves', p1moves)
		}

		activityHandler(
			`${dataFromClient.username} launched an ATTACK: ${currentAttack}`,
		)
	}
	let target = () => {
		return Math.random() > 0.5 ? 1 : 2
	}

	json1 = {type: 'attack'}
	json1.data = {
		user: dataFromClient.username,
		player: target(),
		attack: currentAttack ? currentAttack : 'onCooldown',
		userActivity,
	}
	webSocket.sendMessage(json1)
}

export const userRegisterHandler = (
	dataFromClient,
	clients,
	userID,
	playersReady,
	json,
) => {
	clients = webSocket.getClients()
	let json1 = json
	if (webSocket.getClientByType('username', dataFromClient.username)) {
		json1.data = {
			username: 'UsrNameTaken',
			'user-id': userID,
			userActivity,
		}
		webSocket.sendMessage(json1, {userid: userID})
		return
	}
	webSocket.setClients(userID, 'username', dataFromClient.username)

	let activity = activityHandler(
		`${dataFromClient.username} joined the Game as Player ${dataFromClient.player} with UID ${userID}`,
	)
	if (dataFromClient.player === 'spectator') {
		webSocket.setClients(userID, 'player', 'spectator')
	} else if (
		!isNaN(dataFromClient.player) &&
		dataFromClient.player <= 2 &&
		dataFromClient.player > 0
	) {
		webSocket.setClients(userID, 'player', dataFromClient.player)
		webSocket.incrementPlayers()
	}
	json1.data = {
		username: dataFromClient.username,
		userid: userID,
		player: dataFromClient.player,
		playersReady: playersReady,
		userActivity: activity,
	} //add user +activity to the data of our response
	let msg = {type: 'chat'}
	msg.data = {
		chat: defaultChatMsg,
	}
	webSocket.sendMessage(msg, {userid: userID}) //sending game instructions directly to chat
	let output = {
		json: json1.data,
	}
	return output
}

let file = HIGHSCORE_FILE //apply path from config
const checkHighscore = async (UID, highscore, time) => {
	let fileExists = false
	fs.mkdir('server/logs/', {recursive: true}, (err) => {
		if (err) {
			throw err
		} else {
			console.log('nice we got it already')
			checkFile()
		}
	})
	const checkFile = () => {
		fs.access(file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
			if (err) {
				console.error(
					`${file} ${
						err.code === 'ENOENT'
							? 'does not exist'
							: 'is read-only'
					}`,
				)
				fs.writeFileSync(file, '', (e) => {
					console.log('file created', e)
					fileExists = true
				})
			} else {
				console.log(`${file} exists, and it is writable`)
				fileExists = true
			}
		})
	}
	return fileExists
}
const writeToHighscore = (data, UID, highscore, time, place) => {
	let newHighscoreData = {...data, [UID]: {highscore: highscore, time: time, rank: place}}
	fs.writeFile(file, JSON.stringify(newHighscoreData), 'utf-8', (e) => {
		console.log('file created', e)
	})
	console.log('write', newHighscoreData)
}
export const readHighscore = async (UID, highscore, time, f) => {
	let jsonData
	let getdata = await fs.readFile(file, (err, buffer) => {
		let data = buffer.toString()
		console.log('data', data)
		jsonData = data === '' ? '' : JSON.parse(data)
		console.log('jsonData', jsonData)
		if (f) {
			let scorer  = Object.keys(jsonData)
			let place = 11
			for (scorer in jsonData) {
				if (jsonData[scorer].highscore < highscore) {
					place--
					console.log('place',place)
				} 
			}
			if (place <= 11){f(jsonData, UID, highscore, time, place)}
		} else {
			let messageHistory = [...UID]
			let scorer  = Object.keys(jsonData)
			for (scorer in jsonData) {
				messageHistory = [ ...messageHistory, `Server: Player ${scorer} made ${jsonData[scorer].highscore} Points in ${jsonData[scorer].time} Seconds` ]
			}
			console.log(messageHistory)
			webSocket.sendMessage({type: 'chat', data: {chat: messageHistory}})
		}
	})
}

export const setHighscore = (UID) => {
	console.log(UID)
	let user = webSocket.getClientByType('userid', UID)
	console.log(user)
	let score = (user.score / user.time) * user.score * 100
	console.log(score)
	let fileReady = checkHighscore().then(
		readHighscore(user.username, score, user.time, writeToHighscore),
	)
}
export default gameTimer