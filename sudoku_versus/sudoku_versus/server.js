//server

import http from 'http'
const WebSocketSrv = () => {
	const webSocketServerPort = 8080
	const webSocketServer = require('websocket').server
	const http = require('http')
	const klsudoku = require('klsudoku')
	// starting the http server and the websocket server.
	const server = http.createServer()
	server.listen(webSocketServerPort)
	const wsServer = new webSocketServer({httpServer: server})
	const clients = {} //keeps track of connected clients
	const users = {} //obj keeps track of ALL USERS
	let spectators = {} //obj keeps track of SPECTATORS
	let players = {} //obj that keeps track of PLAYERS
	let userActivity = []
	let gameField1 = {} //PLayer 1 values
	let gameField2 = {} //Player 2 Values
	let messageHistory = [
		'Server: Hey Players 👋,The game starts when both players joined & you type /start in the chat. Your field is the blue one. To fill in a field simply click it and start typing, players have the option to reset their own field.',
		'Server: Hey Spectators! 🤩 Attacks are selected at random and will be launched at both players & become available after a time delay. F in the chat guys'
	]
	let playersReady = 0 //count if both players are ready
	const reqTypes = {
		//defining user request types
		USER_EVENT: 'userevent',
		GAME_MOVE: 'gamemove',
		ATTACK: 'attack',
		RESET: 'resetgame',
		CHAT: 'chat'
	}
	const attackTypes = {
		//defining attack types
		STROBO: 'stroboscope',
		DELETE: 'delete random entry',
		SHAKE: 'shakes the playfield',
		SWITCH: 'switches playfield values',
		MEME: 'display distracting memes & gifs'
	}
	////////TIMER FUNCTION///////////
	let playTimer = 0
	let startTime
	const gameTimer = () => {
		playTimer = playTimer + 1
		playTimer.toFixed(3)
		console.log(playTimer) ///wait 1 seconds until cleint is rdy to recieve
		sendMessage(JSON.stringify({type: 'time', time: playTimer}))
	}
	if (playersReady === 2) {
		startTime = setInterval(gameTimer, 1000)
	}
	if (playersReady <= 2) {
		clearInterval(startTime)
	}
	/////////////////////////////////

	//TODO SOLVER & GENERATOR
	let puzzle
	let solution
	const sudokuMaster = (sudoku) => {
		if (sudoku) {
			for (let keyid in sudoku) {
				let key = keyid.replace('cell', '')
				let rowid = key[0]
				let cellid = key[1]
				let userInputValue = sudoku[keyid]
				let position = Number(rowid) * 9 + Number(cellid)

				console.log(position)
				console.log(
					`${userInputValue} verglichen mit  ${solution[position]}`
				)
				if (userInputValue !== solution[position]) {
					alert('come on, you can do better than that!')
					return
				}
			}
		} else {
			let result = klsudoku.generate()
			console.log(result)
			puzzle = result.puzzle
			solution = result.solution
			console.log(solution, puzzle)
			result = klsudoku.solve(puzzle)
			let tiles = puzzle.match(/.{1,9}/g)
			let board = tiles.map((tile) =>
				tile.split('').map((t) => (t === '.' ? null : Number(t)))
			)
			return board
		}

		console.log(board)
	}

	const handleAttacks = (dataFromClient) => {
		const randomAttack = (obj) => {
			let attackKey = Object.keys(obj)
			return obj[attackKey[(attackKey.length * Math.random()) << 0]]
		}

		let currentAttack = randomAttack(attackTypes)
		console.log(currentAttack)

		userActivity.push(
			`${dataFromClient.username} launched an ATTACK: ${currentAttack}`
		)
		let json
		json = {type: 'attack'}
		json.data = {
			user: dataFromClient.username,
			player: dataFromClient.player,
			attack: currentAttack,
			userActivity
		}
		console.log(json)
		sendMessage(JSON.stringify(json))
	}

	// generates unique userid for everyuser.
	const getUniqueID = () => {
		const s4 = () =>
			Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1)
		return s4() + '-' + s4()
	}
	///////// SENDING GENERAL RESPONSES /////////////
	const sendMessage = (json) => {
		// We are sending the current data to all connected clients
		Object.keys(clients).map((client) => {
			clients[client].sendUTF(json)
		})
	}
	//// SeNDING RESPONSE TO GAME MOVES ////////
	const sendGameMove = (json) => {
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

	wsServer.on('request', function(request) {
		var userID = getUniqueID()
		console.log(
			new Date() +
				' Recieved a new connection from origin ' +
				request.origin +
				'.'
		)
		let json = {
			//send initial info on connect(how many PLAYERS connected)
			type: 'info',
			players: playersReady,
			board: sudokuMaster()
		}
		console.log(json)
		setTimeout(function() {
			sendMessage(JSON.stringify(json)) ///wait 1 seconds until cleint is rdy to recieve
		}, 1000)

		// You can rewrite this part of the code to accept only the requests from allowed origin
		const connection = request.accept(null, request.origin)
		clients[userID] = connection
		console.log('connected: ' + userID + ' in ' + clients)

		connection.on('message', function(message) {
			console.log('new Request: ', message)
			const dataFromClient = JSON.parse(message.utf8Data)
			const json = {type: dataFromClient.type} //prepare answer with same type as request

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
				if (dataFromClient.msg === '/newboard') {
					console.log('/newboard detected')
					let json = {
						type: 'info',
						players: playersReady,
						board: sudokuMaster()
					}
					console.log(json)
					setTimeout(function() {
						sendMessage(JSON.stringify(json)) ///wait 200 mseconds until cleint is rdy to recieve
					}, 200)
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