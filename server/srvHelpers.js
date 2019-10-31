import { json, webSocket } from './server'
import activityHandler, { userActivity } from './activityHandler'
import * as CONFIG from '../src/config.json'
////////TIMER FUNCTION///////////
let playTimer = 0
let startTime = null
const fs = require('fs')
export const gameTimer = () => {
    playTimer = playTimer + 1
    playTimer.toFixed(3)
    webSocket.sendMessage({ type: 'time', time: playTimer })
}
export const startTimer = () => {
    startTime = setInterval(gameTimer, 1000)
}
export const stopTimer = () => {
    clearInterval(startTime)
}

// generates unique userid for everyuser.
export const getUniqueID = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)
    return s4() + '-' + s4()
}
//////////////////// attacks /////////////////////

let lastAttack = Number(0)
const attackCooldown = () => {
    lastAttack = lastAttack + 33
    console.log('cooldown over ( ͡° ͜ʖ ͡°)')
}
export const handleAttacks = dataFromClient => {
    let canAttack
    if (!canAttack) {
        canAttack = setTimeout(attackCooldown, CONFIG.COOLDOWN)
    }
    let json1 = json
    let currentAttack
    if (lastAttack > 30) {
        lastAttack = 0
        clearTimeout(canAttack)
        const randomAttack = obj => {
            let attackKey = Object.keys(obj)
            return obj[attackKey[(attackKey.length * Math.random()) << 0]]
        }
        currentAttack = randomAttack(CONFIG.attackTypes)
        if (currentAttack === CONFIG.attackTypes.SWITCH) {
            let p1 = webSocket.getClientByType('player', 1)
            let p2 = webSocket.getClientByType('player', 2)
            let msg = { type: 'gamemove' }
            let p1moves = { ...p1.moves }
            let p2moves = { ...p2.moves }
            //switching clientside
            for (let i = 1; i < 3; i++) {
                msg.data = {
                    player: i,
                    gameField: i > 1 ? p1moves : p2moves
                }
                webSocket.sendMessage(msg)
            }
            console.log('p1', p1moves)
            console.log('p2', p2moves)
            msg.data = {
                gameField1: p2moves,
                gameField2: p1moves
            }
            webSocket.sendMessage(msg, 'spectator')
            //switching server side
            webSocket.setClients(p1.userid, 'moves', p2moves)
            webSocket.setClients(p2.userid, 'moves', p1moves)
        }

        activityHandler(
            `${dataFromClient.username} launched an ATTACK: ${currentAttack}`
        )
    }
    let target = () => {
        return Math.random() > 0.5 ? 1 : 2
    }

    json1 = { type: 'attack' }
    json1.data = {
        user: dataFromClient.username,
        player: target(),
        attack: currentAttack ? currentAttack : 'onCooldown',
        userActivity
    }
    webSocket.sendMessage(json1)
}

export const userRegisterHandler = (
    dataFromClient,
    clients,
    userID,
    playersReady,
    json
) => {
    clients = webSocket.getClients()
    let json1 = json
    if (webSocket.getClientByType('username', dataFromClient.username)) {
        json1.data = {
            username: 'UsrNameTaken',
            'user-id': userID,
            userActivity
        }
        webSocket.sendMessage(json1, { userid: userID })
        return
    }
    webSocket.setClients(userID, 'username', dataFromClient.username)

    let activity = activityHandler(
        `${dataFromClient.username} joined the Game as Player ${dataFromClient.player} with UID ${userID}`
    )
    if (dataFromClient.player === 'spectator') {
        webSocket.setClients(userID, 'player', 'spectator')
    } else if (
        !isNaN(dataFromClient.player) &&
    dataFromClient.player <= 2 &&
    dataFromClient.player > 0
    ) {
        webSocket.setClients(userID, 'player', dataFromClient.player)
        webSocket.incrementPlayers()
    }
    json1.data = {
        username: dataFromClient.username,
        userid: userID,
        player: dataFromClient.player,
        playersReady: playersReady,
        userActivity: activity
    } //add user +activity to the data of our response
    let msg = { type: 'chat' }
    msg.data = {
        chat: CONFIG.defaultChatMsg
    }
    webSocket.sendMessage(msg, { userid: userID }) //sending game instructions directly to chat
    let output = {
        json: json1.data
    }
    return output
}

let file = CONFIG.HIGHSCORE_FILE //apply path from config
const checkHighscore = async () => {
    let fileExists = false
    fs.mkdir('server/logs/', { recursive: true }, err => {
        if (err) {
            throw err
        } else {
            checkFile()
        }
    })
    const checkFile = () => {
        fs.access(file, fs.constants.F_OK | fs.constants.W_OK, err => {
            if (err) {
                console.error(
                    `${file} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`
                )
                fs.writeFileSync(file, '', e => {
                    console.log('file created', e)
                    fileExists = true
                })
            } else {
                console.log(`${file} exists, and it is writable`)
                fileExists = true
            }
        })
    }
    return fileExists
}
const writeToHighscore = (data, UID, highscore, time, place) => {
    let newHighscore = {
        username: UID,
        highscore: highscore,
        time: time,
        rank: place
    }
    let newHighscoreArray = [...data.highscore]
    newHighscoreArray.splice(place - 1, 0, newHighscore)
    for (let y = newHighscoreArray.length; y > 10; ) {
        newHighscoreArray.splice(-1, 1)
        y = newHighscoreArray.length
    }
    let newHighscoreData = { highscore: newHighscoreArray }
    fs.writeFileSync(file, JSON.stringify(newHighscoreData), 'utf-8')
    console.log('write', newHighscoreData)
}
export const readHighscore = (UID, highscore, time, f) => {
    return new Promise((fullfill, reject) => {
        let jsonData
        fs.readFile(file, (err, buffer) => {
            let data = buffer.toString()
            jsonData = data === '' ? '' : JSON.parse(data)
            console.log('jsonData.highscore', jsonData.highscore)
            if (f) {
                let place = 11
                for (let x = 9; x > -1; x--) {
                    if (jsonData.highscore[x].highscore < highscore) {
                        place--
                    }
                }
                if (place < 11) {
                    f(jsonData, UID, highscore, time, place)
                    fullfill()
                }
            } else {
                let newHighscoreArray = [...jsonData.highscore]
                return fullfill(newHighscoreArray)
            }
        })
    })
}

export const setHighscore = async UID => {
    await checkHighscore()
    let data = []
    for (let uid in UID) {
        let user = webSocket.getClientByType('userid', UID[uid])
        let score = Math.floor((user.score / user.time) * user.score * 100)
        data.push({ user, score })
    }
    readHighscore(
        data[0].user.username,
        data[0].score,
        data[0].user.time,
        writeToHighscore
    ).then(
        readHighscore(
            data[1].user.username,
            data[1].score,
            data[1].user.time,
            writeToHighscore
        )
    )
}
export default gameTimer
