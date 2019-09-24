	////////TIMER FUNCTION///////////
import {playersReady, sendMessage, spectators, players, gameField1, gameField2, dataFromClient, userActivity, json} from "./server"


	let playTimer = 0
	let startTime = null
	export const gameTimer = () => {
		playTimer = playTimer + 1
		playTimer.toFixed(3)
		console.log(playTimer) ///wait 1 seconds until cleint is rdy to recieve
		sendMessage(JSON.stringify({type: 'time', time: playTimer}))
	}
	export const startTimer = () =>  {
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
		const s4 = () =>
			Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1)
		return s4() + '-' + s4()
	}
	
	//// SeNDING RESPONSE TO GAME MOVES ////////
	export const sendGameMove = (json) => {
		Object.keys(players).map((player) => {
			console.log('plapyersend', player)
			players[player].sendUTF(JSON.stringify(json))
		})
		json.field = {
			gamefield1: gameField1,
			gamefield2: gameField2
		}
		Object.keys(spectators).map((spectator) => {
			console.log('spectatorsend', spectator)
			spectators[spectator].sendUTF(JSON.stringify(json))
		})
	}
//////////////////// attacks /////////////////////
const attackTypes = {
		//defining attack types
		STROBO: 'stroboscope',
		DELETE: 'delete random entry',
		SHAKE: 'shakes the playfield',
		SWITCH: 'switches playfield values',
		MEME: 'display distracting memes & gifs'
	}

	//TODO SOLVER & GENERATOR

	export const handleAttacks = (dataFromClient) => {
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
	export default gameTimer