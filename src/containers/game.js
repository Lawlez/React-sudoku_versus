import React, {useEffect} from 'react'
import store from '../store'
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
import logo from '../static/sudokuvs.png'
import {createSnackbar, closeSnackbar} from '../store/notify/notifyActions'
import {setChatHistory, setUserActivity} from '../store/chat/chatActions'
import {setUserName, setLoggedIn} from '../store/user/userActions'
import {
	Container,
	Paper,
	Grid,
	CircularProgress,
	Button,
	makeStyles,
} from '@material-ui/core'
require('babel-polyfill') //to make async work with webpack
import {MyButton, RenderBoard, GetReady} from '../components'
import {client} from '..'
import {connect} from 'react-redux'
import Login from './login'
import Chat from './chat'
import {bindActionCreators} from 'redux'
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
import {CSS, COOLDOWN, ATTACK_DURATION} from '../config'
import Timer from './timer'
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
		margin: theme.spacing(0.5),
		color: '#f6f6f6',
	},
	buttonProgress: {
		color: 'green',
		position: 'absolute',
		marginTop: 15,
		marginLeft: -70,
	},
}))

export const Game = (props) => {
	const classes = useStyles()
	let dataFromServer
	const newSnackBar = (text, actionText, type) => {
		props.createSnackbar({
			message: text,
			options: {
				key: new Date().getTime() + Math.random(),
				variant: type,
				action: (key) => (
					<Button
						className={classes.button}
						variant="outlined"
						color="inherit"
						onClick={() => props.closeSnackbar(key)}
					>
						{actionText}
					</Button>
				),
			},
		})
	}
	useEffect(() => {
		let index = props.userActivity.length - 1
		console.log('USEFEECT RAN')
		if (index != -1) {
			newSnackBar(props.userActivity[index], 'nice', 'info')
		}
	}, [props.userActivity])
	////// Websocket functions start///////////////////
	client.onopen = () => {
		sendMessage(null, null, 'ready') //tell srv we're ready
		console.log('%cWebSocket Client Connected to server\n\n', CSS)
		newSnackBar('WebSocket Client Connected to server', 'cool', 'info')
	}
	client.onclose = () => {
		console.warn(
			'%cWebSocket server closing or offline...',
			'color:orange;font-size:large',
		)
		newSnackBar('WebSocket server closing or offline...', 'Dang..', 'error')
	}
	client.onmessage = (message) => {
		dataFromServer = JSON.parse(message.data)
		console.log(
			'%cim RECIEVING parsed: Type: %c%s',
			'color:#baf; font-size:large',
			'color:#0f0; font-size:large',
			dataFromServer.type,
		)
		console.table(
			dataFromServer && dataFromServer.board
				? dataFromServer.board
				: dataFromServer,
		)

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
				newSnackBar('username already exists! sorry :c ','okay','warning')
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
			props.setGameMove(undefined)
		}

		if (dataFromServer.type === 'chat') {
			props.setChatHistory([...dataFromServer.data.chat])
		}

		if (dataFromServer.type === 'solve') {
			
			let board = dataFromServer.data.gamefield
			let x = 0
			for (let row in board) {
				console.count(board[row])
				let y = 0
				for (let cell in board[row]) {
					let move = {
						type: 'gamemove',
						player: props.user.playerNumber,
						username:props.user.userName,
						input: board[row][cell],
						inputPos: `cell${x}${y}`,
					}
					y++
					console.count(move)
					client.send(JSON.stringify(move))
				}
				x++
			}
		}
		if (dataFromServer.type === 'gamemove') {
			console.log('in gamemove')

			if (props.user.playerNumber === 'spectator') {
				if (dataFromServer.data.gameField1) {
					props.setGameMove(dataFromServer.data.gameField1)
					props.setOpponentMove(dataFromServer.data.gameField2)
					console.log(props.fieldInput)
				}
			} else {
				console.log(
					`my number ${props.user.playerNumber} message num ${dataFromServer.data.player}`,
				)
				if (dataFromServer.data.player === props.user.playerNumber) {
					console.log('I made a move')
					props.setGameMove(dataFromServer.data.gameField)
					console.log(props.fieldInput)
				} else {
					console.log('OPPONENT made a move')
					props.setOpponentMove(dataFromServer.data.gameField)
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
			newSnackBar(
				dataFromServer.data.userActivity[index],
				'(∩ᵔ ͜ʖᵔ)⊃━☆ﾟ.*',
				'warning',
			)
			let attack = handleAttacks(dataFromServer)
			if (attack === 'onCooldown') {
				props.setCooldown(true)
				setTimeout(function() {
					props.setCooldown(false)
				}, COOLDOWN)
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
						}, ATTACK_DURATION)
						break
					case 'BLACK':
						props.setShake({board: 'black', cell: 'black'})
						setTimeout(function() {
							props.setShake({board: null, cell: null})
						}, ATTACK_DURATION)
						break
					case 'MEME':
						console.log(
							'%c( ͡° ͜ʖ ͡°) getting %cMemes',
							'color: green; font size:large;',
							CSS,
						)
						getDankMemes(props.setMemes)
						setTimeout(function() {
							props.setMemes(false)
						}, ATTACK_DURATION)
						break
					case 'SWITCH':
						break
					}
				}
			}
		}	
	}
	////// Websocket functions end///////////////////
	return (
		<div className="game">
			{!props.user.isLoggedIn ? (
				<Login />
			) : (
				<div>
					{!props.ready && !isNaN(props.user.playerNumber) ? (
						<GetReady
							playerName={props.user.userName}
							playerNumber={props.user.playerNumber}
						/>
					) : (
						console.log(props.ready)
					)}
					<Container>
						<img className="logo" src={logo} />
						<Timer />
					</Container>
					{props.memes ? (
						<div className="memecontainer">
							<div className="memes">{props.memes}</div>
						</div>
					) : (
						''
					)}
					<Container className="fieldContainer">
						<Grid container>
							<Grid
								item
								xs={6}
								className={'gameField1 ' + props.shake.board}
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
										fields={props.board}
										handleUserInput={(e, cellID) =>
											handleUserInput(
												e,
												cellID,
												props.user.userName,
												props.user.playerNumber,
											)
										}
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
												cooldown={props.cooldown}
											/>
											,
											{props.cooldown | !props.ready ? (
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
															props.user
																.playerNumber,
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
															props.user
																.playerNumber,
															props.fieldInput,
															store.getState()
																.game.time,
															newSnackBar,
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
										fields={props.board}
										opponent="true"
									/>
								</Paper>
							</Grid>
						</Grid>
					</Container>
					<Container>
						<Chat />
					</Container>
				</div>
			)}
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		user: state.user,
		board: state.game.board,
		cooldown: state.game.cooldown,
		memes: state.game.memes,
		shake: state.game.shake,
		ready: state.game.ready,
		fieldInput: state.game.fieldInput,
		userActivity: state.chat.userActivity,
		time: state.game.time
	}
}

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			setUserName,
			setLoggedIn,
			setGameMove,
			setOpponentMove,
			setAllPlayers,
			setGameTime,
			setBoard,
			setCooldown,
			setShake,
			setMemes,
			setReady,
			setChatHistory,
			setUserActivity,
			createSnackbar,
			closeSnackbar,
		},
		dispatch,
	),
})
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Game)