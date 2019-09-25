//server-side Chat handler
import {getBoard} from "./sudokuHandler"
import {sendMessage, playersReady, users,} from "./server"
import gameTimer, {startTimer, stopTimer, handleAttacks, } from './srvHelpers'
let messageHistory = [
		'Server: Hey Players 👋,The game starts when both players joined & you type /start in the chat. Your field is the blue one. To fill in a field simply click it and start typing, players have the option to reset their own field.',
		'Server: Hey Spectators! 🤩 Attacks are selected at random and will be launched at both players & become available after a time delay. F in the chat guys'
	]
export const ChatHandler = async (klsudoku, userID, sudokuHandler, currentBoard, dataFromClient) => {
let json1 = {
type: dataFromClient.type}
	console.log(dataFromClient.msg)
	if (dataFromClient.msg === '/start') {//>>>works
		console.log('/start detected')
		startTimer()
	}else if (dataFromClient.msg === '/stop') {
		console.log('/stop detected')
		stopTimer()
	}
	if (
		(dataFromClient.msg === '/newboard') |
		(dataFromClient.msg === '/newboard easy') //>>>works
	) {
		console.log('/newboard detected')
		currentBoard = await getBoard('easy')
		json1 = {
			type: 'info',
			players: playersReady,
			board: currentBoard
		}
		console.log(json1)
		sendMessage(JSON.stringify(json1))
		json1 = {type: 'chat'}
	}
	if (dataFromClient.msg === '/newboard medium') { //>>>works
		console.log('/newboard detected')
		currentBoard = await getBoard('medium')
		json1 = {
			type: 'info',
			players: playersReady,
			board: currentBoard
		}
		console.log(json1)
		sendMessage(JSON.stringify(json1))
		json1 = {type: 'chat'}
	}
	if (dataFromClient.msg === '/newboard hard') { //>>>works
		console.log('/newboard detected')
		currentBoard = await getBoard('hard')
		json1 = {
			type: 'info',
			players: playersReady,
			board: currentBoard
		}
		console.log(json1)
		sendMessage(JSON.stringify(json1))
		json1 = {type: 'chat'}
	}
	if (dataFromClient.msg === '/solve') { //>>>works
		console.log('/solve detected')
		let solverMask = [].concat(...currentBoard)
		console.log('mask', solverMask)
		solverMask = solverMask.toString()
		solverMask = solverMask.replace(/,/g, '')
		console.log('stringmask', solverMask)
		let solution = klsudoku.solve(solverMask)
		solution = solution.solution
		let tiles = solution.match(/.{1,9}/g)
		let board = tiles.map((tile) => tile.split('').map((t) => Number(t)))
		console.log('sol var', solution)
		json1 = {
			type: 'gamemove'
		}
		json1.data = {
			username: users[userID],
			player: 1,
			gamefield: board
		}
		console.log(json1)
		sendMessage(JSON.stringify(json1))
		json1 = {type: 'chat'}
	}
	if (dataFromClient.msg === '/attack') { //>>>works
		console.log('/attack detected')
		handleAttacks(dataFromClient)
	}

	messageHistory = [
		...messageHistory,
		`${users[userID]}: ${dataFromClient.msg}`
	]
	json1.data = {
		username: users[userID],
		'user-id': userID,
		player: dataFromClient.player,
		chat: messageHistory
	} //add user +activity to the data of our response
	//sendMessage(JSON.stringify(json1))
	return json1
}

export default ChatHandler