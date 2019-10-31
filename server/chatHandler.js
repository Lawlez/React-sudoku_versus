//server-side Chat handler
import { getBoard, getSolution } from './sudokuHandler'
import { webSocket } from './server'
import {
    startTimer,
    stopTimer,
    handleAttacks,
    readHighscore
} from './srvHelpers'
import * as CONFIG from '../src/config.json'
let messageHistory = [...CONFIG.defaultChatMsg]
let currentBoard
/////////// chat commands & callbacks ///////////
const chatCommands = {
    start: params => {
        console.log('start detected')
        startTimer()
        sendChatMessage(params)
    },
    stop: params => {
        console.log('stop detected')
        stopTimer()
        sendChatMessage(params)
    },
    newboard: async params => {
        console.log(`${params.dataFromClient.msg} detected`)
        let match = params.dataFromClient.msg.match(/newboard (easy|medium|hard)/)
        let diff = match && match[1] ? match[1] : 'easy'
        let currentBoard = await getBoard(diff)
        let json = {
            type: 'info',
            players: params.players,
            board: currentBoard
        }
        webSocket.sendMessage(json)
        sendChatMessage(params)
    },
    solve: params => {
        console.log('/solve detected')
        let board = getSolution(true)
        console.log(board)
        let json = {
            type: 'solve'
        }
        json.data = {
            username: params.username,
            player: params.dataFromClient.player,
            gamefield: board
        }
        webSocket.sendMessage(json)
        sendChatMessage(params)
    },
    attack: params => {
        console.log('attack detected')
        if (isNaN(params.dataFromClient.player)) {
            handleAttacks(params.dataFromClient)
            sendChatMessage(params)
        } else {
            console.log('invalid action as player.')
        }
    },
    resetsrv: () => {
        console.log('stopping server')
        stopTimer()
        webSocket.stop()
        console.log('starting server')
        webSocket.start()
    },
    highscore: async params => {
        console.log('yes were heere now')
        await readHighscore(messageHistory).then(score => {
            let json = {
                type: 'highscores',
                highscores: score
            }
            webSocket.sendMessage(json)
        })

    //sendChatMessage(params)
    }
}

const sendChatMessage = params => {
    messageHistory = [
        ...messageHistory,
        `${params.username}: ${params.dataFromClient.msg}`
    ]
    let json = {
        type: 'chat',
        data: {
            username: params.username,
            'user-id': params.userid,
            player: params.dataFromClient.player,
            chat: messageHistory
        }
    }
    webSocket.sendMessage(json)
}
export const newChatHandler = async (dataFromClient, playersReady) => {
    const params = {
        username: dataFromClient.username,
        board: currentBoard,
        players: playersReady,
        userid: webSocket.getClientByType('username', dataFromClient.username)
            .userid,
        dataFromClient: dataFromClient
    }
    let cmd = dataFromClient.msg.replace(/ .*/, '')
    let detectedCommand = Object.keys(chatCommands).find(
        commandName => cmd === `/${commandName}`
    )
    if (detectedCommand) {
        chatCommands[detectedCommand](params)
    } else {
        sendChatMessage(params)
    }
}
export default newChatHandler
