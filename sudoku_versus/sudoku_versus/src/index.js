import {makeStyles} from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import RenderBoard from './board'
import MyButton from './button'
import Timer from './timer'
import Login from './login'
import Chat from './chat'
import {w3cwebsocket as W3CWebSocket} from 'websocket'

const client = new W3CWebSocket('ws://192.168.100.211:8080')

export const fields = [
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
const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		color: theme.palette.text.secondary
	},
	button: {
		margin: theme.spacing(1)
	}
}))

const Game = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false) //toggle logiin
	const [userName, setUserName] = useState()
	const [userActivity, setUserActivity] = useState([])
	const [fieldInput, setFieldInput] = useState({})
	const [opponentFields, setOpponentFields] = useState({})
	const [playerNumber, setPlayerNumber] = useState('')
	const [tempName, setTempName] = useState('')
	const [allPlayers, setAllPlayers] = useState(0)
	const classes = useStyles()
	const [messageHistory, setMessageHistory] = useState([])
	//let messageHistory = []
	let dataFromServer
	console.log(playerNumber)
	////////// Websocket functions start///////////////////
	client.onopen = () => {
		console.log('WebSocket Client Connected to server')
	}
	client.onclose = () => {
		console.log('WebSocket server closing or offline...')
	}
	client.onmessage = (message) => {
		console.log(allPlayers)
		dataFromServer = JSON.parse(message.data)
		console.log('im RECIEVING parsed: ', dataFromServer)
		console.log('im player', playerNumber)

		if (dataFromServer.type === 'info') {
			if (dataFromServer.players) {
				setAllPlayers(dataFromServer.players)
			}
			return
		}
		if (dataFromServer.type === 'userevent') {
			/* ON USEREVENT*/

			let index = dataFromServer.data.userActivity.length - 1
			console.log(dataFromServer.data.userActivity[index])
			let newestActivity = [
				...userActivity,
				dataFromServer.data.userActivity[index]
			]
			setUserActivity(newestActivity)
			console.log(
				tempName,
				'local ... server',
				dataFromServer.data.username
			)
			if (tempName === dataFromServer.data.username) {
				setUserName(dataFromServer.data.username)
				setIsLoggedIn(true)
				console.log('should be loggedin')
			} else if (dataFromServer.data.username === 'UsrNameTaken') {
				alert('username already exists! sorry :c ')
				setIsLoggedIn(false)
			}
			if (dataFromServer.data.playersReady > 0) {
				setAllPlayers(dataFromServer.data.playersReady)
			}
		}

		if (dataFromServer.type === 'resetgame') {
			let index = dataFromServer.data.userActivity.length - 1
			let newestActivity = [
				...userActivity,
				dataFromServer.data.userActivity[index]
			]
			setUserActivity(newestActivity)
			setFieldInput(undefined)
			console.log(fieldInput)
		}

		if (dataFromServer.type === 'chat') {
			setMessageHistory([...dataFromServer.data.chat])
			console.log('index history ', messageHistory)
		}
		console.log(dataFromServer.data.player, 'comp', playerNumber)

		if (dataFromServer.type === 'gamemove') {
			//TODO handle server response for game moves
			//if(!isActive){setIsActive(!isActive)}
			if (playerNumber === 'spectator') {
				if (dataFromServer.field) {
					console.log('spectator hey')
					setFieldInput(dataFromServer.field.gamefield1)
					setOpponentFields(dataFromServer.field.gamefield2)
				}
			} else {
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
		}

		if (dataFromServer.type === 'attack') {
			//TODO handle server response for attacks
		}
	}
	////////// Websocket functions end///////////////////

	const handleUserNameInput = (e) => {
		setTempName(e)
		console.log(e)
		console.log('before submit tempoName: ', tempName)
	}
	const onSubmit = () => {
		let playerN = playerNumber
		console.log('onsubmit tempName: ', tempName)
		if ((playerN === '') & (allPlayers < 1)) {
			console.log('assign P1')
			playerN = Number(1)
		} else if ((playerN === '') & (allPlayers < 2)) {
			console.log('assign P2')
			playerN = Number(2)
		}
		if ((playerN !== undefined) & (playerN !== '')) {
			client.send(
				JSON.stringify({
					username: tempName,
					type: 'userevent',
					player: playerN
				})
			)
			console.log('before send', playerN)
			setPlayerNumber(playerN)
			return
		}
		console.log(playerNumber)
		console.log('player not set')
	}
	const handleUserInput = (input, position, player) => {
		client.send(
			JSON.stringify({
				username: userName,
				player: Number(playerNumber),
				type: 'gamemove',
				input: input,
				inputPos: position
			})
		)
	}
	const handleChatMessage = (msg) => {
		console.log(msg)
		client.send(
			JSON.stringify({
				username: userName,
				player: Number(playerNumber),
				type: 'chat',
				msg: msg
			})
		)
	}

	///// Game Functions /////
	const resetGame = () => {
		client.send(
			JSON.stringify({
				username: userName,
				player: Number(playerNumber),
				type: 'resetgame'
			})
		)
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
			<Container>
				<div className="userActivity">
					activity: {userActivity[userActivity.length - 1]}
				</div>
			</Container>
			{!isLoggedIn ? (
				<Login
					onSubmit={() => onSubmit()}
					handleUserInput={(e) => handleUserNameInput(e)}
					handlePlayerSelect={(e) => setPlayerNumber(e)}
				/>
			) : (
				<div>
					<Container>
						<Timer />
					</Container>
					<Container className="fieldContainer">
						<Grid container>
							<Grid item xs={6} className="playField1">
								<Paper className={classes.paper}>
									<RenderBoard
										handleUserInput={(e, cellID) =>
											handleUserInput(e, cellID)
										}
										inputValues={fieldInput}
										opponentFields={opponentFields}
										player={playerNumber}
									/>
									{isNaN(playerNumber) ? (
										<MyButton
											onClick={() => launchAttack()}
											text="Attack"
											color="secondary"
										/>
									) : (
										<Grid container>
											<Grid item xs={6}>
												<MyButton
													onClick={() => resetGame()}
													text="reset"
													color="default"
												/>
											</Grid>
											<Grid item xs={6}>
												<MyButton
													onClick={() => endGame()}
													text="i'm done!"
													color="primary"
												/>
												<br />
											</Grid>
										</Grid>
									)}
								</Paper>
							</Grid>
							<Grid item xs={6} className="playField2">
								<Paper className={classes.paper}>
									<RenderBoard
										handleUserInput
										opponent="true"
										opponentFields={opponentFields}
										player={playerNumber}
									/>
								</Paper>
							</Grid>
						</Grid>
					</Container>
					<Container>
						<Chat
							userName={userName}
							client={client}
							history={messageHistory}
							onMessage={(msg) => handleChatMessage(msg)}
						/>
					</Container>
				</div>
			)}
		</div>
	)
}

ReactDOM.render(<Game />, document.getElementById('root'))