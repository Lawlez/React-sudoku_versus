import React, {useState} from 'react'
import {
	setAllPlayers,
	setBoard,
	setGameTime,
	setReady,
	setCooldown,
	setGameMove,
	setOpponentMove,
	setShake,
	setMemes,
} from '../store/game/gameActions'
import { setChatHistory, setUserActivity } from '../store/chat/chatActions'
import { setUserName, setLoggedIn, setPlayerN } from '../store/user/userActions'
import {
	Container,
	Paper,
	Grid,
	CircularProgress,
	makeStyles,
} from '@material-ui/core'
require('babel-polyfill') //to make async work with webpack
import {
	Timer,
	MyButton,
	RenderBoard,
	GetReady,
} from '../components'
import {client} from '..'
import {connect} from 'react-redux'
import Login from './login'
import Chat from './chat'
import {
	handleUserInput,
	resetGame,
	endGame,
	launchAttack,
	deleteValue,
	sendMessage,
	handleAttacks,
	getDankMemes,
} from './handlers'

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		color: theme.palette.text.secondary,
	},
	button: {
		margin: theme.spacing(1),
	},
	buttonProgress: {
		color: 'green',
		position: 'absolute',
		marginTop: 15,
		marginLeft: -70,
	},
}))

export const Game = (props) => {
	//const [isLoggedIn, setIsLoggedIn] = useState(false) //toggle logiin
	//const [userName, setUserName] = useState()
	//const [userActivity, setUserActivity] = useState([])
	const [fieldInput, setFieldInput] = useState('')
	const [opponentFields, setOpponentFields] = useState({})
	//const [playerNumber, setPlayerNumber] = useState('')
	//const [tempName, setTempName] = useState('')
	//const [allPlayers, setAllPlayers] = useState(0)
	const classes = useStyles()
	//const [messageHistory, setMessageHistory] = useState([])
	//const [time, setTime] = useState(0)
	//const [board, setBoard] = useState([])
	//const [cooldown, setCooldown] = useState(true)
	let dataFromServer
	//const [shake, setShake] = useState({board: null, cell: null})
	//const [memes, setMemes] = useState(false)
	//const [ready, setReady] = useState(false)
	////// Websocket functions start///////////////////
	client.onopen = () => {
		sendMessage(null, null, 'ready') //tell srv we're ready
		console.log('WebSocket Client Connected to server')
	}
	client.onclose = () => {
		console.warn('WebSocket server closing or offline...')
	}
	client.onmessage = (message) => {
		// console.log(message)
		dataFromServer = JSON.parse(message.data)
		console.log('im RECIEVING parsed:', dataFromServer)
		// console.log('im player ', playerNumber)

		if (dataFromServer.type === 'info') {
			if (dataFromServer.players) {
				props.setAllPlayers(dataFromServer.players)
			}
			if (dataFromServer.board) {
				props.setBoard(dataFromServer.board)
			}
			return
		}
		if (dataFromServer.type === 'time') {
			props.setGameTime(dataFromServer.time)
			return
		}
		if (dataFromServer.type === 'readyup') {
			props.setReady(true)
			props.setCooldown(false)
			return
		}
		if (dataFromServer.type === 'userevent') {
			/* ON USEREVENT*/
			console.log(
				`${props.user.tempName} local ... server ${dataFromServer.data.username}`,
			)
			let index = dataFromServer.data.userActivity.length - 1
				console.log(
					`UserActivity index: ${dataFromServer.data.userActivity[index]}`,
				)
				let newestActivity = [
					...props.userActivity,
					dataFromServer.data.userActivity[index],
				]
				props.setUserActivity(newestActivity)
			if (props.user.tempName === dataFromServer.data.username) {
				
				props.setUserName(dataFromServer.data.username)
				props.setLoggedIn(true)
			} else if (dataFromServer.data.username === 'UsrNameTaken') {
				alert('username already exists! sorry :c ')
				props.setLoggedIn(false)
			}
			if (dataFromServer.data.playersReady > 0) {
				props.setAllPlayers(dataFromServer.data.playersReady)
			}
		}

		if (dataFromServer.type === 'resetgame') {
			let index = dataFromServer.data.userActivity.length - 1
			let newestActivity = [
				...props.userActivity,
				dataFromServer.data.userActivity[index],
			]
			props.setUserActivity(newestActivity)
			setFieldInput(undefined)
		}

		if (dataFromServer.type === 'chat') {
			props.setChatHistory([...dataFromServer.data.chat])
		}

		if (dataFromServer.type === 'gamemove') {
			console.log('in gamemove')

			if (props.user.playerNumber === 'spectator') {
				if (dataFromServer.data.gameField1) {
					setFieldInput(dataFromServer.data.gameField1)
					setOpponentFields(dataFromServer.data.gameField2)
					console.log(fieldInput)
				}
			} else {
				console.log(
					`my number ${props.user.playerNumber} message num ${dataFromServer.data.player}`,
				)
				if (dataFromServer.data.player === props.user.playerNumber) {
					console.log('I made a move')
					setFieldInput(dataFromServer.data.gameField)
					console.log(fieldInput)
				} else {
					console.log('OPPONENT made a move')
					setOpponentFields(dataFromServer.data.gameField)
				}
			}
		}
		if (dataFromServer.type === 'endgame') {
			props.setChatHistory([
				dataFromServer.data.userActivity[
					dataFromServer.data.userActivity.length - 1
				],
			])
			return
		}
		if (dataFromServer.type === 'attack') {
			let index = dataFromServer.data.userActivity.length - 1
			let newestActivity = [
				...props.userActivity,
				dataFromServer.data.userActivity[index],
			]
			props.setUserActivity(newestActivity)
			let attack = handleAttacks(dataFromServer)
			if (attack === 'onCooldown') {
				props.setCooldown(true)
				setTimeout(function() {
					props.setCooldown(false)
				}, 15000)
				return
			}
			if (attack && attack.state ? attack.state : null) {
				if (
					(attack.target === props.user.playerNumber) |
					(props.user.playerNumber === 'spectator')
				) {
					switch (attack.type) {
						case 'SHAKE':
							props.setShake({
								board:
									'shake-slow shake-constant shake-constant-hover',
								cell: 'shake-freeze shake-crazy',
							})
							setTimeout(function() {
								props.setShake({board: null, cell: null})
							}, 3000)
							break

						case 'BLACK':
							props.setShake({board: 'black', cell: 'black'})
							setTimeout(function() {
								props.setShake({board: null, cell: null})
							}, 3000)
							break
						case 'MEME':
							console.log('inside memes gen')
							getDankMemes(props.setMemes)
							setTimeout(function() {
								props.setMemes(false)
							}, 3000)
							break
						case 'SWITCH':
							break
					}
				}
			}
		}
	}
	console.log(props.game.cooldown, props.game.ready)
	////// Websocket functions end///////////////////
	return (
		<div className="game">
			<Container>
				<div className="userActivity">
					activity: {props.userActivity[props.userActivity.length - 1]}
				</div>
			</Container>
			{!props.user.isLoggedIn ? (
				<Login/>
			) : (
				<div>
					{!props.game.ready && !isNaN(props.user.playerNumber) ? (
						<GetReady
							playerName={props.userName}
							setReady={setReady}
							playerNumber={props.user.playerNumber}
						/>
					) : (
						console.log(props.game.ready)
					)}
					<Container>
						<Timer time={props.game.time} />
					</Container>
					{props.game.memes ? (
						<div className="memecontainer">
							<div className="memes">{props.game.memes}</div>
						</div>
					) : (
						''
					)}
					<Container className="fieldContainer">
						<Grid container>
							<Grid
								item
								xs={6}
								className={'gameField1 ' + props.game.shake.board}
							>
								<Paper className={classes.paper}>
									<RenderBoard
										deleteValue={(cell) =>
											deleteValue(
												cell,
												props.user.userName,
												props.user.playerNumber,
											)
										}
										fields={props.game.board}
										handleUserInput={(e, cellID) =>
											handleUserInput(
												e,
												cellID,
												props.user.userName,
												props.user.playerNumber,
											)
										}
										inputValues={fieldInput}
										opponentFields={opponentFields}
										player={props.user.playerNumber}
										shake={props.game.shake.cell}
									/>
									{isNaN(props.user.playerNumber) ? (
										<div>
											<MyButton
												onClick={() =>
													launchAttack(
														props.user.userName,
														props.user.playerNumber,
													)
												}
												text="Attack"
												color="secondary"
												cooldown={props.game.cooldown}
											/>
											,
											{props.game.cooldown | !props.game.ready ? (
												<CircularProgress
													size={24}
													className={
														classes.buttonProgress
													}
												/>
											) : (
												''
											)}
										</div>
									) : (
										<Grid container>
											<Grid item xs={6}>
												<MyButton
													onClick={() =>
														resetGame(
															props.user.userName,
															props.user.playerNumber,
														)
													}
													text="reset"
													color="default"
												/>
											</Grid>
											<Grid item xs={6}>
												<MyButton
													onClick={() =>
														endGame(
															props.user.userName,
															props.user.playerNumber,
															fieldInput,
														)
													}
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
										fields={props.game.board}
										handleUserInput
										opponent="true"
										opponentFields={opponentFields}
										player={props.user.playerNumber}
									/>
								</Paper>
							</Grid>
						</Grid>
					</Container>
					<Container>
						<Chat/>
					</Container>
				</div>
			)}
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		user: state.user,
		game: state.game,
		userActivity: state.chat.userActivity,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		setUserName: (name) => {
			dispatch(setUserName(name))
		},
		setLoggedIn: (login) => {
			dispatch(setLoggedIn(login))
		},
		setPlayerN: (number) => {
			dispatch(setPlayerN(number))
		},
		setGameMove: (move) => {
			dispatch(setGameMove(move))
		},
		setOpponentMove: (move) => {
			dispatch(setOpponentMove(move))
		},
		setAllPlayers: (players) => {
			dispatch(setAllPlayers(players))
		},
		setGameTime: (time) => {
			dispatch(setGameTime(time))
		},
		setBoard: (board) => {
			dispatch(setBoard(board))
		},
		setCooldown: (cooldown) => {
			dispatch(setCooldown(cooldown))
		},
		setShake: (shake) => {
			dispatch(setShake(shake))
		},
		setMemes: (memes) => {
			dispatch(setMemes(memes))
		},
		setReady: (ready) => {
			dispatch(setReady(ready))
		},
		setChatHistory: (history) =>{
			dispatch(setChatHistory(history))
		},
		setUserActivity: (activity) => {
			dispatch(setUserActivity(activity))
		},
	}
}
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Game)