import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import RenderBoard from './board'
import Button from './button'
import Timer from './timer'
import Login from './login'
import {w3cwebsocket as W3CWebSocket} from 'websocket'


const client = new W3CWebSocket('ws://192.168.100.211:8080')

const fields = [
	[4, 8, null, null, null, 5, null, 9, 7],
	[null, null, 7, 2, null, 9, 3, null, 6],
	[9, 2, 6, 4, 7, 3, null, null, null],
	[null, null, null, 9, 6, null, null, 8, null],
	[1, null, 8, null, 3, 7, null, null, 4],
	[7, null, 5, null, null, null, null, 6, null],
	[3, null, 9, null, null, null, null, null, null],
	[null, null, null, 3, null, null, 4, 7, null],
	[6, 4, 1, null, 5, 2, null, null, null]
]

const Game = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [userName, setUserName] = useState()
	const [userActivity, setUserActivity] = useState([])
	const [fieldInput, setFieldInput] = useState({})
	const [opponentFields, setOpponentFields] = useState({})
	const [playerNumber, setPlayerNumber] = useState()
	const [timer, setTimer] = useState(0)
	let tempName
	let dataFromServer
	const[isActive, setIsActive] = useState(false)

useEffect(()=>{
	let interval

	if (isActive) {
		interval = setInterval(()=>{
			setTimer(timer => timer +1)
		},1000)

	}else if(!isActive && timer !== 0){
		clearInterval(interval)
	}
	return () => clearInterval(interval)
}, [isActive, timer])

	////////// Websocket functions start///////////////////
	client.onopen = () => {
		console.log('WebSocket Client Connected to server')
	}
	client.onclose = () => {
		console.log('WebSocket server closing or offline...')
	}
	client.onmessage = (message) => {
		dataFromServer = JSON.parse(message.data)
		console.log('im RECIEVING parsed: ', dataFromServer)
		console.log('im player', playerNumber)
		if (dataFromServer.type === 'userevent') {
			/* ON USEREVENT*/

			let index = dataFromServer.data.userActivity.length - 1
			console.log(dataFromServer.data.userActivity[index])
			let newestActivity = [
				...userActivity,
				dataFromServer.data.userActivity[index]
			]
			setUserActivity(newestActivity)
			if (tempName === dataFromServer.data.username) {
				setUserName(dataFromServer.data.username)

				setIsLoggedIn(true)
			} else {
				setIsLoggedIn(isLoggedIn)
			}
		}
		console.log(dataFromServer.data.player, 'comp', playerNumber)
		if (dataFromServer.type === 'gamemove') {
			//TODO handle server response for game moves
			if(!isActive){setIsActive(!isActive)}
			if (dataFromServer.data.player === playerNumber) {
				console.log('I made a move')

				setFieldInput(dataFromServer.data.gamefield)
				console.log(fieldInput)
			} else {
				console.log('OPPONENT made a move')
				setOpponentFields(dataFromServer.data.gamefield)
				console.log(opponentFields)
			}
		}

		if (dataFromServer.type === 'attack') {
			//TODO handle server response for attacks
		}
	}
	////////// Websocket functions end///////////////////

	//helper function for RenderBoard
	const getFields = (i, id) => {
		let fieldValue = fields[i][id]

		return fieldValue
	}
	const handleUserNameInput = (e) => {
		setUserName(e)
	}
	const onSubmit = (e) => {
		let data = userName
		tempName = userName
		client.send(
			JSON.stringify({
				username: data,
				type: 'userevent',
				player: playerNumber
			})
		)
	}
	const handleUserInput = (input, position, player) => {
		
			client.send(
				JSON.stringify({
					username: userName,
					player: playerNumber,
					type: 'gamemove',
					input: input,
					inputPos: position
				}))
		
	}

	///// Game Functions /////
	const resetGame = () => {
		setFieldInput('')
		client.send(
				JSON.stringify({
					username: userName,
					player: playerNumber,
					type: 'resetgame',
					}))
	}
	const endGame = () => {
		console.log('TODO end game function')
	}
	const launchAttack = () => {
		console.log('TODO launch attack function')
	}
	////// end Game Functions /////

	return (
		<div className="game">
			<div className="userActivity">
				activity: {userActivity[userActivity.length - 1]}
			</div>
			{!isLoggedIn ? (
				<Login
					onSubmit={() => onSubmit()}
					uName={userName}
					handleUserInput={(e) => handleUserNameInput(e)}
					handlePlayerSelect={(e) => setPlayerNumber(Number(e))}
				/>
			) : (
				<div>
					<Timer time={timer} />
					<div className="fieldContainer">
						<div className="playField1">
							<RenderBoard
								fields={(i, id) => getFields(i, id)}
								handleUserInput={(e, cellID) =>
									handleUserInput(e, cellID)
								}
								inputValues={fieldInput}
								opponentFields={opponentFields}
							/>
							<Button onClick={() => resetGame()} text="reset" />
							<Button
								onClick={() => endGame()}
								text="i'm done!"
							/>
							<Button
								onClick={() => launchAttack()}
								text="Attack"
								extraclass="attack"
							/>
						</div>
						<div className="playField2">
							<RenderBoard
								fields={(i, id) => getFields(i, id)}
								handleUserInput
								opponent="true"
								opponentFields={opponentFields}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

ReactDOM.render(<Game />, document.getElementById('root'))