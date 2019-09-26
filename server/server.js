//server
import WebSocketSrv from './websocket'
const klsudoku = require('klsudoku')
///////// SENDING GENERAL RESPONSES /////////////
export const sendMessage = (json) => {
	// We are sending the current data to all connected clients
	console.log('sendmessage sends: ',json)
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

WebSocketSrv(
	users,
	userActivity,
	dataFromClient,
	clients,
	gameField1,
	gameField2,
	spectators,
	players,
	json,
	playersReady
)