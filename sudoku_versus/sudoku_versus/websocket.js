//WS
import http from 'http'
import chatHandler from './chatHandler'
import {sendMessage, klsudoku} from './server'
import gameTime, {getUniqueID, sendGameMove, handleAttacks, attackTypes, userRegisterHandler} from './srvHelpers'
import sudokuHandler, {
	getBoard,
	endGame,
	currentBoard
} from './sudokuHandler'
export const WebSocketSrv = async (users,userActivity,dataFromClient,clients,gameField1,gameField2,spectators,players,json,playersReady) => {
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
		console.log('current board ist jetzt', currentBoard)
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
		}, 500)
		const connection = request.accept(null, request.origin)
		clients[userID] = connection
		console.log('connected: ' + userID + ' in ' + clients)
		connection.on('message', async function(message) {
			console.log('new Request: ', message)
			dataFromClient = JSON.parse(message.utf8Data)
			json = {type: dataFromClient.type} //prepare answer with same type as request

			//////////////////HANDLING LOGIN AND USER_EVENT //////////////////
			if (dataFromClient.type === reqTypes.USER_EVENT) { //>>>works
				let output = userRegisterHandler(dataFromClient, users, userID, playersReady, spectators, players)
				json.data = output.json
				players = output.players
				spectators = output.spectators
				playersReady = output.playersrdy
				console.log(spectators)
			}
			//////////////////HANDLING RESET /////////////////////////////////
			if (dataFromClient.type === reqTypes.RESET) { //>>>works
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
				}
			}
			//////////////////HANDLING CHAT////////////////////////////////////
			if (dataFromClient.type === reqTypes.CHAT) { //>>>works
				json = await chatHandler(
					klsudoku,
					userID,
					sudokuHandler,
					currentBoard,
					dataFromClient
				)
			}
			////////////////// HANDLE GAME_MOVES //////////////////////////////
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
			///////////////HANDLE ATTACKS ///////////////////////////////////
			if (dataFromClient.type === reqTypes.ATTACK) { //>>>works
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
			if (dataFromClient.type === reqTypes.ENDGAME) { //>>>works
				json.data = endGame(userActivity, gameField1, gameField2, dataFromClient)
			}
			////////////SENDING RESPONSES /////////////////////////////////
			console.log('Message I sent to client: ', json)
			if (json.type === 'gamemove') {
				sendGameMove(json, players, spectators)
				return
			}
			sendMessage(JSON.stringify(json))
		})
		////////////// ON CLOSE //////////////////////////////////////////
		connection.on('close', function(connection) {
			console.log(new Date() + ' Peer ' + userID + ' disconnected.')
			const json = {type: reqTypes.USER_EVENT}
			let userLeft = users[userID] && users[userID].username
			userActivity.push(`${userLeft} left the Game`)
			json.data = {users, userActivity}
			if (playersReady > 0) {
				playersReady--
			}
			//todo clean player and spectator arrays 
			delete clients[userID]
			delete users[userID]
			sendMessage(JSON.stringify(json))
		})
	})
}
export default WebSocketSrv