import {w3cwebsocket as W3CWebSocket} from 'websocket'
import {makeStyles} from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import React, {useState} from 'react'
import RenderBoard from './board'
import ReactDOM from 'react-dom'
import MyButton from './button'
import Timer from './timer'
import Login from './login'
import Chat from './chat'
import './index.css'

const client = new W3CWebSocket('ws://192.168.100.211:8080')
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
	const [time , setTime] = useState(0)
	const [board, setBoard] = useState([])
	//let messageHistory = []
	let dataFromServer
	console.log('Players rdy: ', allPlayers)
	////////// Websocket functions start///////////////////
	client.onopen = () => {
		console.log('WebSocket Client Connected to server')
	}
	client.onclose = () => {
		console.log('WebSocket server closing or offline...')
	}
	client.onmessage = (message) => {
		console.log(message)
		dataFromServer = JSON.parse(message.data)
		console.log('im RECIEVING parsed: ', dataFromServer)
		console.log('im player ', playerNumber)

		if (dataFromServer.type === 'info') {
			if (dataFromServer.players) {
				setAllPlayers(dataFromServer.players)
			}
			if (dataFromServer.board) {
				setBoard(dataFromServer.board)
			}
			return
		}
		if (dataFromServer.type === 'time') {
			setTime(dataFromServer.time)
			return
		}
		if (dataFromServer.type === 'userevent') {
			/* ON USEREVENT*/

			let index = dataFromServer.data.userActivity.length - 1
			console.log('UserActivity index: ',dataFromServer.data.userActivity[index])
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
		
		if (dataFromServer.type === 'gamemove') {
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
			let index = dataFromServer.data.userActivity.length - 1
			let newestActivity = [
				...userActivity,
				dataFromServer.data.userActivity[index]
			]
			setUserActivity(newestActivity)
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
			sendMessage({
					username: tempName,
					type: 'userevent',
					player: playerN
				})
			console.log('before send', playerN)
			setPlayerNumber(playerN)
			return
		}
		console.log(playerNumber)
		console.log('player not set')
	}
	const sendMessage = (json) =>{
		client.send(JSON.stringify(json))
	}
	const handleUserInput = (input, position, player) => {
		sendMessage({
				username: userName,
				player: Number(playerNumber),
				type: 'gamemove',
				input: input,
				inputPos: position
			})
		
	}
	const handleChatMessage = (msg) => {
		console.log(msg)
		sendMessage({
				username: userName,
				player: Number(playerNumber),
				type: 'chat',
				msg: msg
			})
	}

	///// Game Functions /////
	const resetGame = () => {
		sendMessage({
				username: userName,
				player: Number(playerNumber),
				type: 'resetgame'
			})
	}
	const endGame = () => {
		console.log('TODO end game function')
		if (Object.keys(fieldInput).length < 30) {console.log('fill the board first bro')
			return}
		sendMessage({
				username: userName,
				player: Number(playerNumber),
				type: 'endgame'
			})
	}
	const launchAttack = () => {
		sendMessage({
				username: userName,
				player: Number(playerNumber),
				type: 'attack'
			})
	}
	////// end Game Functions /////
	const deleteValue = (cell) => {
		sendMessage({
				username: userName,
				player: Number(playerNumber),
				type: 'gamemove',
				input: '',
				inputPos: cell
			})
	}

	console.log('Is evryone READY TO  MF PLAY')
	console.log(allPlayers === 2)
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
						<Timer time={time} />
					</Container>
					<Container className="fieldContainer">
						<Grid container>
							<Grid item xs={6} className="playField1">
								<Paper className={classes.paper}>
									<RenderBoard
									deleteValue={(cell)=>deleteValue(cell)}
									fields={board}
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
									fields={board}
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