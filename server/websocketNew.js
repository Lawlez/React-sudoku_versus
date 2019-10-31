/* eslint-disable no-case-declarations */
//websocket as class
import http from 'http'
import * as CONFIG from '../src/config.json'
import {
    getUniqueID,
    handleAttacks,
    userRegisterHandler,
    startTimer
} from './srvHelpers'
import { newChatHandler } from './chatHandler'
import { getBoard, endGame, currentBoard } from './sudokuHandler'
import { activityHandler, userActivity } from './activityHandler'
export class WebSocket {
    constructor() {
        this.clients = []
        this.initialBoard = this.getInitialBoard()
        this.playersReady = Number(0)
        this.ready = Number(0)
        this.port = CONFIG.SRV_PORT
        this.server = http.createServer()
        this.webSocketServer = require('websocket').server
        this.wsServer = new this.webSocketServer({ httpServer: this.server })
        this.wsServer.on('request', this.handleConnection.bind(this))
    }

    start() {
        console.time('started in')
        this.server.listen(this.port)
        console.log(
            '\n*̱̹̦̳ͦͥ̀ͥ͐\n**\n***\nStarted SudokuServer with following settings (∩ᵔ ͜ʖᵔ)⊃━☆ﾟ.*:'
        )
        console.table({
            SRV_PORT: CONFIG.SRV_PORT,
            INITIAL_BOARD: CONFIG.INITIAL_BOARD,
            COOLDOWN: CONFIG.COOLDOWN,
            ATTACK_DURATION: CONFIG.ATTACK_DURATION,
            DEV_ENV: CONFIG.DEV_ENV,
            HIGHSCORE_FILE: CONFIG.HIGHSCORE_FILE,
            SCORE_EQUATION: CONFIG.SCORE_EQUATION
        })
        console.table(CONFIG.attackTypes)
        console.groupEnd()
        console.timeEnd('started in')
        console.log('\nヽ(⌣ ͜ʖ⌣”)ﾉ')
    }
    stop() {
        this.server.close()
    }
    /*eslint-disable */
  async getInitialBoard() {
    /*eslint-enable */
        return await getBoard(CONFIG.INITIAL_BOARD) //starting board
    }
    addClient(connection, userID) {
        this.clients.push({
            userid: userID,
            connection: connection
        })
        console.log(`connected: ${userID} from  ${connection.remoteAddress}`)
    }
    removeClient(id) {
        let clients = [...this.clients]
        let clientIndex = clients.findIndex(client => client.userid === id)
        clients.splice(clientIndex, 1)
        this.clients = clients
    }

    handleConnection(request) {
        const connection = request.accept(null, request.origin)
        let userID = getUniqueID()
        this.addClient(connection, userID)
        connection.on('message', message => {
            if (message.type !== 'utf8') {
                return
            }
            this.handleRequest(message, userID)
        })
        connection.on('close', () => {
            console.log('User', userID, 'has left the game.')
            let client = this.getClientByType('userid', userID)
            if (!isNaN(client.player)) {
                this.ready = this.ready > 0 ? this.ready - 1 : this.ready
                this.playersReady = this.playersReady - 1
                console.log('was a player, making room for new players')
            }
            this.removeClient(userID)
        })
    }
    sendMessage(data, filter = {}) {
        let clients = this.getClients(filter)
        data = JSON.stringify(data)
        for (let i = 0; i < clients.length; i++) {
            clients[i].connection.sendUTF(data)
        }
        console.log('MESSAGE WE SENT TO CLIENT:', filter, JSON.parse(data))
    }
    handleRequest(message, userID) {
        let request = JSON.parse(message.utf8Data)
        console.log('request', request)
        let json = { type: request.type }
        let output
        switch (request.type) {
        case CONFIG.reqTypes.READY:
            if (currentBoard.length > 0) {
                this.initialBoard = currentBoard
            } //send initial info on connect(how many PLAYERS connected)
            json = {
                type: 'info',
                players: this.playersReady,
                board: this.initialBoard
            }
            this.sendMessage(json)
            break
        case CONFIG.reqTypes.USER_EVENT:
            output = userRegisterHandler(
                request,
                this.clients,
                userID,
                this.playersReady,
                json
            )
            json.data = output && output.json ? output.json : '' ///solve this if empty
            this.sendMessage(json)
            break
        case CONFIG.reqTypes.READYUP:
            this.ready = this.ready + 1
            console.log(this.ready)
            if (this.ready >= 2) {
                startTimer()
                this.sendMessage(json)
            }

            break
        case CONFIG.reqTypes.GAME_MOVE:
            json.data = {
                player: request.player,
                username: request.username,
                userid: request.userid
            }
            json.data.gameField = this.setGameMove(request)
            this.sendMessage(json, { player: 1 })
            this.sendMessage(json, { player: 2 })
            let player1 = this.getClientByType('player', 1)
            let player2 = this.getClientByType('player', 2)
            json.data = {
                player: 'spectator',
                gameField1: player1 && player1.moves ? player1.moves : {},
                gameField2: player2 && player2.moves ? player2.moves : {}
            }
            this.sendMessage(json, { player: 'spectator' })
            break
        case CONFIG.reqTypes.CHAT:
            newChatHandler(request, this.playersReady)
            return
        case CONFIG.reqTypes.RESET:
            this.resetBoard(request.username)
            break
        case CONFIG.reqTypes.ATTACK:
            handleAttacks(request)
            break
        case CONFIG.reqTypes.ENDGAME:
            endGame(request)
            break
        }
    }
    getClients(filter = {}) {
        let clients = this.clients.filter(client => {
            let keys = Object.keys(filter)
            for (let i = 0; i < keys.length; ) {
                if (client[keys[i]] !== filter[keys[i]]) {
                    return false
                }
                i++
            }
            return true
        })
        return clients
    }
    getClientByType(type, filter) {
        return this.clients.find(client => client[type] === filter)
    }
    getClientIndex(userid) {
        return this.clients.findIndex(client => client.userid === userid)
    }
    setClients(userid, key, content) {
        let client = this.getClientByType('userid', userid)
        client[key] = content

        let index = this.getClientIndex(userid)
        if (index === -1) {
            index = 0
        }
        this.clients[index] = client
    }
    incrementPlayers() {
        this.playersReady++
        let json = {
            type: 'info',
            players: this.playersReady,
            board: this.initialBoard
        }
        this.sendMessage(json)
    }
    setGameMove(request) {
        let move = request.input
        let position = request.inputPos
        let client = this.getClientByType('username', request.username)
        let index = this.getClientIndex(client.userid)
        client.moves = { ...client.moves, [position]: move }
        this.clients[index] = client

        return client.moves
    }
    resetBoard(username) {
        let currUser = this.getClientByType('username', username)
        this.setClients(currUser.userid, 'moves', {})
        currUser = this.getClientByType('username', username)
        this.sendMessage({
            type: 'gamemove',
            data: { player: currUser.player, gameField: currUser.moves }
        })
        activityHandler(` Player ${currUser.player} just reset his board`)
        this.sendMessage({
            type: 'resetgame',
            data: { player: currUser.player, userActivity }
        })
    }
    punish(player) {
        let json = { type: 'attack' }
        json.data = {
            player: player,
            attack: 'shakes the playfield',
            userActivity: [
                `Player ${player} gets punished for submitting false values.😤 `
            ]
        }
        this.sendMessage(json)
    }
}

export default WebSocket
