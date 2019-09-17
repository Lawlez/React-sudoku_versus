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
	const gameField1 = {}
	const gameField2 = {}
	const reqTypes = {
		USER_EVENT: 'userevent',
		GAME_MOVE: 'gamemove',
		ATTACK: 'attack'
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
				users[userID] = dataFromClient.username
				userActivity.push(
					`${dataFromClient.username} joined the Game as Player ${dataFromClient.player} with UID ${userID}`
				)
				json.data = {
					username: users[userID],
					'user-id': userID,
					userActivity
				} //add user +activity to the data of our response
			}

			if (dataFromClient.type === reqTypes.GAME_MOVE) {
				
				if (dataFromClient.player === 1){
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
				if (dataFromClient.player === 2){
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
			delete clients[userID]
			delete users[userID]
			sendMessage(JSON.stringify(json))
		})
	})
}

WebSocketSrv()