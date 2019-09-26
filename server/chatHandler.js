//server-side Chat handler
import {getBoard} from './sudokuHandler'
import {sendMessage, playersReady, users} from './server'
import gameTimer, {startTimer, stopTimer, handleAttacks} from './srvHelpers'
import {defaultChatMsg} from '../config'
let messageHistory = [...defaultChatMsg]

/////////// chat commands & callbacks ///////////
const chatCommands = {
	start: (params) => {
		console.log('start detected')
		startTimer()
		sendChatMessage(params)
	},
	stop: (params) => {
		console.log('stop detected')
		stopTimer()
		sendChatMessage(params)
	},
	newboard: async (params) => {
		console.log('newboard detected')
		let currentBoard = await getBoard('easy')
		let json = {
			type: 'info',
			players: params.players,
			board: currentBoard
		}
		sendMessage(JSON.stringify(json))
		sendChatMessage(params)
	},
	'newboard medium': async (params) => {
		console.log('newboard medium detected')
		let currentBoard = await getBoard('medium')
		let json = {
			type: 'info',
			players: params.players,
			board: currentBoard
		}
		sendMessage(JSON.stringify(json))
		sendChatMessage(params)
	},
	'newboard hard': async (params) => {
		console.log('newboard hard detected')
		let currentBoard = await getBoard('hard')
		let json = {
			type: 'info',
			players: params.players,
			board: currentBoard
		}
		sendMessage(JSON.stringify(json))
		sendChatMessage(params)
	},
	'newboard easy': async (params) => {
		console.log('newboard easy detected')
		let currentBoard = await getBoard('easy')
		let json = {
			type: 'info',
			players: params.players,
			board: currentBoard
		}
		sendMessage(JSON.stringify(json))
		sendChatMessage(params)
	},
	solve: (params) => {
		console.log('/solve detected')
		const klsudoku = require('klsudoku')
		let solverMask = [].concat(...params.board)
		console.log(`mask ${solverMask}`)
		solverMask = solverMask.toString()
		solverMask = solverMask.replace(/,/g, '')
		console.log(`stringmask ${solverMask}`)
		let solution = klsudoku.solve(solverMask)
		solution = solution.solution
		let tiles = solution.match(/.{1,9}/g)
		let board = tiles.map((tile) => tile.split('').map((t) => Number(t)))
		console.log(`sol var ${solution}`)

		let json = {
			type: 'gamemove'
		}
		json.data = {
			username: params.username,
			player: params.dataFromClient.player,
			gamefield: board
		}
		sendMessage(JSON.stringify(json))
		sendChatMessage(params)
	},
	attack: (params) => {
		console.log('attack detected')
		handleAttacks(params.dataFromClient)
	}
}
const sendChatMessage = (params) => {
	messageHistory = [...messageHistory, `${params.username}: ${params.dataFromClient.msg}`]
	let json = {
		type: 'chat'
	}
	json.data = {
		username: params.username,
		'user-id': params.userid,
		player: params.dataFromClient.player,
		chat: messageHistory
	}
	console.log('sendChatMessage returns:', json)
	sendMessage(JSON.stringify(json))
}
export const newChatHandler = async (
	userID,
	sudokuHandler,
	currentBoard,
	dataFromClient
) => {
	const params = {
		username: users[userID],
		board: currentBoard,
		players: playersReady,
		userid: userID,
		dataFromClient: dataFromClient
	}
	let detectedCommand = Object.keys(chatCommands).find(
		(commandName) => dataFromClient.msg === `/${commandName}`
	)
	if (detectedCommand) {
		chatCommands[detectedCommand](params)
	} else {
		sendChatMessage(params)
	}
}
export default newChatHandler