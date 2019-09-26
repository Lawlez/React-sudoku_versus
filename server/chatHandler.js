//server-side Chat handler
import {getBoard, getSolution} from './sudokuHandler'
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
		console.log(`${params.dataFromClient.msg} detected`)
		let diff = params.dataFromClient.msg.replace(/(\w+)(\W)\b/g,'').replace(/[/]/,'') //regex find last word in str
		console.log('diff is:',diff) 
		let currentBoard = await getBoard((diff !== 'easy' & diff !== 'medium' & diff !== 'hard') ? 'easy' : diff)
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
		let board = getSolution(true)
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
		commandName => dataFromClient.msg.replace(/ .*/,'') === `/${commandName}`
		
	)
	console.log("dataFromClient.msg.replace(/ .*/,'')", dataFromClient.msg.replace(/ .*/,''));
	if (detectedCommand) {
		chatCommands[detectedCommand](params)
	} else {
		sendChatMessage(params)
	}
}
export default newChatHandler