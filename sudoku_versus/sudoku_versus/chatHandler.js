//server-side Chat handler
import {getBoard} from "./sudokuHandler"
import {sendMessage} from "./server"
let messageHistory = [
		'Server: Hey Players 👋,The game starts when both players joined & you type /start in the chat. Your field is the blue one. To fill in a field simply click it and start typing, players have the option to reset their own field.',
		'Server: Hey Spectators! 🤩 Attacks are selected at random and will be launched at both players & become available after a time delay. F in the chat guys'
	]
export const ChatHandler = async (dataFromClient, currentBoard, klsudoku, users, userID, sudokuHandler, playersReady) => {
let json = {}
	console.log(dataFromClient.msg)
	if (dataFromClient.msg === '/start') {
		console.log('/start detected')
		startTime = setInterval(gameTimer, 1000)
	}
	if (dataFromClient.msg === '/stop') {
		console.log('/stop detected')
		console.log(startTime)
		clearInterval(startTime)
	}
	if (
		(dataFromClient.msg === '/newboard') |
		(dataFromClient.msg === '/newboard easy')
	) {
		console.log('/newboard detected')
		currentBoard = await getBoard('easy')
		json = {
			type: 'info',
			players: playersReady,
			board: currentBoard
		}
		console.log(json)
		//sendMessage(JSON.stringify(json))
	}
	if (dataFromClient.msg === '/newboard medium') {
		console.log('/newboard detected')
		currentBoard = await getBoard('medium')
		json = {
			type: 'info',
			players: playersReady,
			board: currentBoard
		}
		console.log(json)
		//sendMessage(JSON.stringify(json))
	}
	if (dataFromClient.msg === '/newboard hard') {
		console.log('/newboard detected')
		currentBoard = await getBoard('hard')
		json = {
			type: 'info',
			players: playersReady,
			board: currentBoard
		}
		console.log(json)
		//sendMessage(JSON.stringify(json))
	}
	if (dataFromClient.msg === '/solve') {
		console.log('/solve detected')
		let solverMask = [].concat(...currentBoard)
		console.log('mask', solverMask)
		solverMask = solverMask.toString()
		solverMask = solverMask.replace(/,/g, '')
		console.log('stringmask', solverMask)
		solution = klsudoku.solve(solverMask)
		solution = solution.solution
		let tiles = solution.match(/.{1,9}/g)
		let board = tiles.map((tile) => tile.split('').map((t) => Number(t)))
		console.log('sol var', solution)
		json = {
			type: 'gamemove'
		}
		json.data = {
			username: users[userID],
			player: 1,
			gamefield: board
		}
		console.log(json)
		//sendMessage(JSON.stringify(json))
	}
	if (dataFromClient.msg === '/attack') {
		console.log('/attack detected')
		handleAttacks(dataFromClient)
	}

	messageHistory = [
		...messageHistory,
		`${users[userID]}: ${dataFromClient.msg}`
	]
	json.data = {
		username: users[userID],
		'user-id': userID,
		player: dataFromClient.player,
		chat: messageHistory
	} //add user +activity to the data of our response
	console.log('jsonin sendhandkler',json)
	//sendMessage(JSON.stringify(json))
	return json
}

export default ChatHandler