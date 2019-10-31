//handlers
import React from 'react'
import { client } from '../index'
import * as config from '../config.json'
import '../static/SFX/notification_simple-01.wav'
import '../static/SFX/notification_decorative-01.wav'
import '../static/SFX/alert_error-03.wav'
import '../static/SFX/attack.wav'
import '../static/SFX/ui_tap.wav'
import '../static/SFX/navigation_transition-right.wav'
import '../static/SFX/Mysterious2.wav'
import '../static/SFX/Mahjongg.wav'
import '../static/SFX/C64-Endgame.wav'
import '../static/SFX/LobbyNES.wav'
////// login ///////
export const onSubmit = (playerNumber, tempName, allPlayers, setPlayerN) => {
    let playerN = playerNumber
    console.log(playerN)
    if ((playerN === null) & (allPlayers < 1)) {
        playerN = Number(1)
    } else if ((playerN === null) & (allPlayers < 2)) {
        playerN = Number(2)
    }
    if ((playerN !== undefined) & (playerN !== null)) {
        sendMessage(tempName, playerN, 'userevent')
        setPlayerN(playerN)
        return
    }
    console.log('player not set')
}
export const soundFxHandler = (type) => {
    const notificationError = new Audio('/static/SFX/alert_error-03.wav')
    const chatNotification = new Audio('/static/SFX/notification_decorative-01.wav')
    const attackSound = new Audio('/static/SFX/attack.wav')
    const resetSound = new Audio('/static/SFX/navigation_transition-right.wav')
    const inputSound = new Audio('/static/SFX/ui_tap.wav', {ThrottleMs: 100})
    const notification = new Audio('/static/SFX/notification_simple-01.wav')
    const music1 = 'static/SFX/Mahjongg.wav'
    const music2 = 'static/SFX/Mysterious2.wav'
    const lobby = 'static/SFX/LobbyNES.wav'
    const endgame = 'static/SFX/C64-Endgame.wav'
    let audioElement 
    const assignAudio = (id,file,volume,stop) => {
        if (stop){
            audioElement = document.getElementById(stop)
            audioElement.pause()
            document.body.removeChild(audioElement)
        }
        audioElement = document.createElement('audio')
        audioElement.id = id
        audioElement.src = file
        audioElement.preload = 'auto'
        audioElement.loop = true
        document.body.appendChild(audioElement)
        audioElement.volume = volume
        audioElement.play()
    }
    console.log('soundran')
    let x
    switch (type) {
    case 'general':
        notification.volume = 0.6
        notification.play()
        break
    case 'chat':
        chatNotification.volume = 0.6
        chatNotification.play()
        break
    case 'attack':
        attackSound.volume = 1.0
        attackSound.play()
        break
    case 'error':
        notificationError.volume = 0.9
        notificationError.play()
        break
    case 'reset':
        resetSound.volume = 0.8
        resetSound.play()
        break
    case 'input':
        inputSound.volume = 0.7
        inputSound.play()
        break
    case 'lobby':
        assignAudio('lobby',lobby,0.5)
        break
    case 'music':
        x = Math.random()*100
        if (x > 40){
            assignAudio('music',music1,0.6,'lobby')
        }else{
            assignAudio('music',music2,0.6,'lobby')
        }
        break
    case 'endgame':
        assignAudio('music',endgame,0.5,'music')
        break
    default:
        break
    }
}
export const getDankMemes = async setMemes => {
    let posts = []
    let redditData
    let memes = []
    let classes = 'meme shake-slow shake-constant'
    const format = data => {
        for (var i = 2; i < data.length; i++) {
            //start at 2 to ignore pinned posts
            posts.push(data[i].data.url)
        }
        posts.forEach(imageurl => {
            memes.push(<img key={imageurl} src={imageurl} className={classes} />)
        })
        console.log(memes)
        return memes
    }
    let fetchMemes = await fetch('http://www.reddit.com/r/dankmemes/.json')
        .then(r => r.json())
        .then(data => {
            redditData = format(data.data.children)
            setMemes(redditData)
        })
        .catch(e => console.log('Booo', e))
    console.log('fetch', fetchMemes)
    return redditData
}

export const sendMessage = (
    userName,
    playerNumber,
    type,
    msg,
    input,
    position
) => {
    console.log(`i sent player ${playerNumber}`)
    let json = {
        username: userName,
        player: playerNumber,
        type: type,
        msg: msg,
        input: input,
        inputPos: position
    }
    console.log(json)
    client.send(JSON.stringify(json))
}
///// game move //////
export const handleUserInput = (input, position, userName, playerNumber) => {
    sendMessage(userName, playerNumber, 'gamemove', '', input, position)
}

export const sendChatMessage = (msg, userName, playerNumber) => {
    sendMessage(userName, playerNumber, 'chat', msg)
}

///// Game Functions /////
export const resetGame = (userName, playerNumber) => {
    sendMessage(userName, playerNumber, 'resetgame')
}

export const deleteValue = (cell, userName, playerNumber) => {
    sendMessage(userName, playerNumber, 'gamemove', '', '', cell)
}

export const endGame = (
    userName,
    playerNumber,
    fieldInput,
    time,
    newSnackBar
) => {
    if (!fieldInput) {
        newSnackBar('fill the board first bro', 'ok sorry', 'warning')
        return
    } else if (Object.keys(fieldInput).length < 5) {
        newSnackBar('fill at least some values', 'ok sorry', 'warning')
        return
    }
    sendMessage(userName, Number(playerNumber), 'endgame', time)
}
///////// ATTACK function////////
export const launchAttack = (userName, playerNumber) => {
    sendMessage(userName, playerNumber, 'attack')
}

export const handleAttacks = dataFromServer => {
    let attackTypes = config.attackTypes
    let attack = dataFromServer.data.attack
    switch (attack) {
    case attackTypes.SHAKE:
        return {
            state: true,
            target: dataFromServer.data.player,
            type: attackTypes.SHAKE
        }
    case attackTypes.COOL:
        return 'onCooldown'
    case attackTypes.BLACK:
        return {
            state: true,
            target: dataFromServer.data.player,
            type: attackTypes.BLACK
        }
    case attackTypes.MEME:
        return {
            state: true,
            target: dataFromServer.data.player,
            type: attackTypes.MEME
        }
    case attackTypes.SWITCH:
        return {
            state: true,
            target: dataFromServer.data.player,
            type: attackTypes.SWITCH
        }
    }
}
