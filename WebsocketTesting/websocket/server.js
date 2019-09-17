const WebSocketSrv = () => {
	const webSocketServerPort = 8080
	const webSocketServer = require('websocket').server
	const http = require('http')

	// starting the http server and the websocket server.
	const server = http.createServer()
	server.listen(webSocketServerPort)
	const wsServer = new webSocketServer({httpServer: server})

	const clients = {}
	const users = {}
	let editorContent = null
	let userActivity = []
	const reqTypes = {
		USER_EVENT: 'userevent',
		CONTENT_CHANGE: 'contentchange'
	}

	// generates unique userid for everyuser.
	const getUniqueID = () => {
		const s4 = () =>
			Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1)
		return s4() + s4() + '-' + s4()
	}
	const sendMessage = (json) => {
		// We are sending the current data to all connected clients
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
		console.log(users)
		console.log(clients)
		// You can rewrite this part of the code to accept only the requests from allowed origin
		const connection = request.accept(null, request.origin)
		clients[userID] = connection
		console.log(
			'connected: ' +
				userID +
				' in ' +
				Object.getOwnPropertyNames(clients)
		)



		connection.on('message', function(message) {
			console.log('new Request: ',message)
			if (message.type === 'utf8') {
				const dataFromClient = JSON.parse(message.utf8Data)
				const json = {type: dataFromClient.type}
				if (dataFromClient.type === reqTypes.USER_EVENT) {
					users[userID] = dataFromClient
					userActivity.push(
						`${dataFromClient.username} joined to edit the document`
					)

					json.data = {users, userActivity}
				} else if (dataFromClient.type === reqTypes.CONTENT_CHANGE) {
					editorContent = dataFromClient.content
		
					console.log('what is inside editor content? ',editorContent)
					json.data = {editorContent, userActivity}
					//testMessage()
				}
				console.log('Message i sent to client: ',json.data)
				sendMessage(JSON.stringify(json))
			}
		})



		connection.on('close', function(connection) {
			console.log(new Date() + ' Peer ' + userID + ' disconnected.')
			const json = {type: reqTypes.USER_EVENT}
			userActivity.push(`${users[userID].username} left the document`)
			json.data = {users, userActivity}
			delete clients[userID]
			delete users[userID]
			sendMessage(JSON.stringify(json))
		})
	})

	const testMessage = () => {
		const json = {type: reqTypes.CONTENT_CHANGE}
		editorContent = 'testnachricht from server'
		json.data = {editorContent: editorContent}
		console.log(json.data)
		sendMessage(JSON.stringify(json))
	}
}

WebSocketSrv()