//handlers //>>>works
import React from 'react'
import {client} from '../index'
import {attackTypes} from '../config'
////// login ///////
export const onSubmit = (
	playerNumber,
	tempName,
	allPlayers,
	setPlayerN,
) => {
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

export const getDankMemes = async (setMemes) => {
	let posts = []
	let redditData
	let memes = []
	let classes = 'meme shake-slow shake-constant'
	const format = (data) => {
		for (var i = 2; i < data.length; i++) {
			//start at 2 to ignore pinned posts
			posts.push(data[i].data.url)
		}
		posts.forEach((imageurl) => {
			memes.push(
				<img src={imageurl} className={classes}/>
				)
		})
		console.log(memes)
		return memes
	}
	let fetchMemes = await fetch('http://www.reddit.com/r/dankmemes/.json')
		.then((r) => r.json())
		.then((data) => {redditData = format(data.data.children)
			setMemes(redditData)
		})
		.catch((e) => console.log('Booo', e))
		console.log('fetch', fetchMemes)
		return redditData
}

export const sendMessage = (
	userName,
	playerNumber,
	type,
	msg,
	input,
	position,
) => {
	console.log(`i sent player ${playerNumber}`)
	let json = {
		username: userName,
		player: playerNumber,
		type: type,
		msg: msg,
		input: input,
		inputPos: position,
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

export const endGame = (userName, playerNumber, fieldInput) => {
	if (!fieldInput) {
		console.warn('fill the board first bro')
		return
	} else if (Object.keys(fieldInput).length < 5) {
		console.warn('fill at least some values')
		return
	}
	sendMessage(userName, Number(playerNumber), 'endgame')
}
///////// ATTACK function////////
export const launchAttack = (userName, playerNumber) => {
	sendMessage(userName, playerNumber, 'attack')
}

export const handleAttacks = (dataFromServer) => {
	let attack = dataFromServer.data.attack
	switch (attack) {
		case attackTypes.SHAKE:
			return {
				state: true,
				target: dataFromServer.data.player,
				type: 'SHAKE',
			}
		case attackTypes.COOL:
			return 'onCooldown'
		case attackTypes.BLACK:
			return {
				state: true,
				target: dataFromServer.data.player,
				type: 'BLACK',
			}

		case attackTypes.MEME:
			return {
				state: true,
				target: dataFromServer.data.player,
				type: 'MEME'
			}
		case attackTypes.SWITCH:
			return {
				state: true,
				target: dataFromServer.data.player,
				type: 'SWITCH'
			}
	}
}

export const deleteValue = (cell, userName, playerNumber) => {
	sendMessage(userName, playerNumber, 'gamemove', '', '', cell)
}