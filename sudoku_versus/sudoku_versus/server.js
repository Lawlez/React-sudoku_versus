//server

import http from 'http'
const WebSocketSrv = () => {
	const webSocketServerPort = 8080
	const webSocketServer = require('websocket').server
	const http = require('http')
	const solve = require('@mattflow/sudoku-solver')
	// starting the http server and the websocket server.
	const server = http.createServer()
	server.listen(webSocketServerPort)
	const wsServer = new webSocketServer({httpServer: server})

	const clients = {}
	const users = {}
	let userActivity = []
	let gameField1 = {}
	let gameField2 = {}
	let playersReady = 0 //todo array with players
	const reqTypes = {
		USER_EVENT: 'userevent',
		GAME_MOVE: 'gamemove',
		ATTACK: 'attack',
		RESET: 'resetgame'
	}

	// generates unique userid for everyuser.
	const getUniqueID = () => {
		const s4 = () =>
			Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1)
		return s4() + '-' + s4()
	}

	const sendMessage = (json) => {
		// We are sending the current data to all connected clients
		// TODO for array not obj
		Object.keys(clients).map((client) => {
			clients[client].sendUTF(json)
		})
	}

	wsServer.on('request', function(request) {
		var userID = getUniqueID()
		console.log(
			new Date() +
				' Recieved a new connection from origin ' +
				request.origin +
				'.'
		)
		let json = {
			type: 'info',
			players: playersReady
		}
		console.log(json)
		sendMessage(JSON.stringify(json))
		// You can rewrite this part of the code to accept only the requests from allowed origin
		const connection = request.accept(null, request.origin)
		clients[userID] = connection
		console.log('connected: ' + userID + ' in ' + clients)

		connection.on('message', function(message) {
			console.log('new Request: ', message)
			const dataFromClient = JSON.parse(message.utf8Data)
			const json = {type: dataFromClient.type} //prepare answer with same type as request

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
				
				playersReady++


				json.data = {
					username: users[userID],
					'user-id': userID,
					userActivity
				} //add user +activity to the data of our response
			}
			if (dataFromClient.type === reqTypes.RESET) {
				userActivity.push(
					`${dataFromClient.username} RESET the Game as Player ${dataFromClient.player} with UID ${userID}`
				)
				gameField2 = {}
				gameField1 = {}
				json.data = {
					username: users[userID],
					'user-id': userID,
					userActivity
				} //add user +activity to the data of our response
			}

			if (dataFromClient.type === reqTypes.GAME_MOVE) {
				if (dataFromClient.player === 1) {
					
					let index = dataFromClient.inputPos
					gameField1[index] = dataFromClient.input

					json.data = {
						username: users[userID],
						player: 1,
						gamefield: gameField1,
						index: index
					}
					console.log(json.data)
				}
				if (dataFromClient.player === 2) {

					let index = dataFromClient.inputPos
					gameField2[index] = dataFromClient.input
					json.data = {
						username: users[userID],
						player: 2,
						gamefield: gameField2,
						index: index
					}
				}
			}

			//TODO if ATTACK

			console.log('Message i sent to client: ', json)
			sendMessage(JSON.stringify(json))
		})

		connection.on('close', function(connection) {
			console.log(new Date() + ' Peer ' + userID + ' disconnected.')
			const json = {type: reqTypes.USER_EVENT}
			userActivity.push(`${users[userID].username} left the Game`)
			json.data = {users, userActivity}
			//todo if player leaves remove from array
			delete clients[userID]
			delete users[userID]
			sendMessage(JSON.stringify(json))
		})
	})
}

WebSocketSrv()