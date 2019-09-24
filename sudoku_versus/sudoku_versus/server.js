//server
import http from 'http'
import chatHandler from './chatHandler'
import gameTime, {getUniqueID, sendGameMove, handleAttacks} from './srvHelpers'

const klsudoku = require('klsudoku')
import sudokuHandler, {
	getBoard,
	sudokuMaster,
	currentBoard
} from './sudokuHandler'

///////// SENDING GENERAL RESPONSES /////////////
export const sendMessage = (json) => {
	// We are sending the current data to all connected clients
	Object.keys(clients).map((client) => {
		clients[client].sendUTF(json)
	})
}
export const users = {} //obj keeps track of ALL USERS
export let userActivity = []
export let dataFromClient = null
export const clients = {} //keeps track of connected clients
export let gameField1 = {} //PLayer 1 values
export let gameField2 = {} //Player 2 Values
export let spectators = {} //obj keeps track of SPECTATORS
export let players = {} //obj that keeps track of PLAYERS
export let json = {}
export let playersReady = 0 //count if both players are ready
const WebSocketSrv = async () => {
	const webSocketServerPort = 8080
	const webSocketServer = require('websocket').server
	// starting the http server and the websocket server.
	const server = http.createServer()
	server.listen(webSocketServerPort)
	const wsServer = new webSocketServer({httpServer: server})
	const reqTypes = {
		//defining user request types
		USER_EVENT: 'userevent',
		GAME_MOVE: 'gamemove',
		ATTACK: 'attack',
		RESET: 'resetgame',
		CHAT: 'chat',
		ENDGAME: 'endgame'
	}
	let initialBoard = await getBoard('easy') //starting board

	wsServer.on('request', async function(request) {
		var userID = getUniqueID()
		console.log(
			new Date() +
				' Recieved a new connection from origin ' +
				request.origin +
				'.'
		)
		console.log('current board ist jetzt jkg', currentBoard)
		if (currentBoard.length > 5) {
			initialBoard = currentBoard
		}
		let json = {
			//send initial info on connect(how many PLAYERS connected)
			type: 'info',
			players: playersReady,
			board: initialBoard
		}
		console.log(json)
		setTimeout(function() {
			sendMessage(JSON.stringify(json)) ///wait 1 seconds until cleint is rdy to recieve
		}, 1000)
		const connection = request.accept(null, request.origin)
		clients[userID] = connection
		console.log('connected: ' + userID + ' in ' + clients)
		////^^SETUP

		connection.on('message', async function(message) {
			console.log('new Request: ', message)
			dataFromClient = JSON.parse(message.utf8Data)
			json = {type: dataFromClient.type} //prepare answer with same type as request

			//////////////////HANDLING LOGIN AND USER_EVENT //////////////////
			if (dataFromClient.type === reqTypes.USER_EVENT) {
				//TODO : chekc if username exists
				for (let keys in users) {
					if (users[keys] === dataFromClient.username) {
						json.data = {
							username: 'UsrNameTaken',
							'user-id': userID,
							userActivity
						}
						clients[userID].sendUTF(JSON.stringify(json)) //only send to client that sent request
						return
					}
				}
				users[userID] = dataFromClient.username
				userActivity.push(
					`${dataFromClient.username} joined the Game as Player ${dataFromClient.player} with UID ${userID}`
				)
				if (
					dataFromClient.player === 1 ||
					dataFromClient.player === 2
				) {
					players = {...players, player: clients[userID]}
					playersReady++
				}
				let currClient = clients[userID]
				if (dataFromClient.player === 'spectator') {
					spectators = {...spectators, spectator: currClient}
				}
				console.log('spectators: ', spectators)
				json.data = {
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
			}
			//////////////////HANDLING RESET //////////////////
			if (dataFromClient.type === reqTypes.RESET) {
				userActivity.push(
					`${dataFromClient.username} RESET the Game as Player ${dataFromClient.player} with UID ${userID}`
				)
				if (dataFromClient.player === 1) {
					gameField1 = {}
				}
				if (dataFromClient.player === 2) {
					gameField2 = {}
				}
				json.data = {
					username: users[userID],
					'user-id': userID,
					userActivity
				} //add user +activity to the data of our response
			}
			//////////////////HANDLING CHAT//////////////////
			if (dataFromClient.type === reqTypes.CHAT) {
				json = await chatHandler(
					klsudoku,
					userID,
					sudokuHandler,
					currentBoard
				)
			}
			////////////////// HANDLE GAME_MOVES //////////////////
			if (dataFromClient.type === reqTypes.GAME_MOVE) {
				console.log(
					dataFromClient.player,
					'<client',
					dataFromClient.player === 1
				)
				if (dataFromClient.player === 1) {
					console.log('hellouu im player 1')
					let index = dataFromClient.inputPos
					gameField1[index] = dataFromClient.input

					json.data = {
						username: users[userID],
						player: 1,
						gamefield: gameField1,
						index: index
					}
					console.log(json.data)
				} else if (dataFromClient.player === 2) {
					console.log('hellouu im player two')
					let index = dataFromClient.inputPos
					gameField2[index] = dataFromClient.input
					json.data = {
						username: users[userID],
						player: 2,
						gamefield: gameField2,
						index: index
					}
				} else {
					console.log('im not player 1 |2 ')
					json.data = {
						user: users[userID],
						player: dataFromClient.player,
						warn: 'ILLEGAL MOVE'
					}
				}
			}
			///////////////HANDLE ATTACKS ////////////////////
			if (dataFromClient.type === reqTypes.ATTACK) {
				const randomAttack = (obj) => {
					let attackKey = Object.keys(obj)
					return obj[
						attackKey[(attackKey.length * Math.random()) << 0]
					]
				}
				let currentAttack = randomAttack(attackTypes)
				console.log(currentAttack)
				userActivity.push(
					`${dataFromClient.username} launched an ATTACK: ${currentAttack}`
				)
				json.data = {
					user: users[userID],
					player: dataFromClient.player,
					attack: currentAttack,
					userActivity
				}
			}
			if (dataFromClient.type === reqTypes.ENDGAME) {
				let player1Win = sudokuMaster(gameField1)
				let player2Win = sudokuMaster(gameField2)
				if (player2Win === true) {
					userActivity.push(
						`Player 2 has WON the game! Congratulations!`
					)
				} else if (player1Win === true) {
					userActivity.push(
						`Player 1 has WON the game! Congratulations!`
					)
				} else {
					userActivity.push(
						`Nobody filled the board correctly.. Player1:${player1Win} PLayer2:${player2Win}`
					)
				}
				json.data = {
					player: dataFromClient.player,
					player1: player1Win,
					player2: player2Win,
					userActivity
				}
			}
			////////////SENDING RESPONSES ////////////////////
			if (json.type === 'gamemove') {
				sendGameMove(json)
				return
			}
			console.log('Message i sent to client: ', json)
			sendMessage(JSON.stringify(json))
		})
		///////// ON CLOSE ///////////////
		connection.on('close', function(connection) {
			console.log(new Date() + ' Peer ' + userID + ' disconnected.')
			const json = {type: reqTypes.USER_EVENT}
			let userLeft = users[userID] && users[userID].username
			userActivity.push(`${userLeft} left the Game`)
			json.data = {users, userActivity}
			if (playersReady > 0) {
				playersReady--
			}
			//todo if player leaves remove from array
			delete clients[userID]
			delete users[userID]
			sendMessage(JSON.stringify(json))
		})
	})
}

WebSocketSrv()