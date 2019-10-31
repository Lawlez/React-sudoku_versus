//dependencies
import React, {useEffect} from 'react'
import store from '../store/store'
import {connect} from 'react-redux'
//components/containers
import {
    Container,
    Paper,
    Grid,
    CircularProgress,
    makeStyles,
} from '@material-ui/core'
import {
    handleUserInput,
    resetGame,
    endGame,
    launchAttack,
    deleteValue,
    sendMessage,
    handleAttacks,
    getDankMemes,
    soundFxHandler
} from './handlers'
import CountingDown from './countdown'
import {MyButton, RenderBoard, GetReady, Highscores} from '../components'
import Login from './login'
import Chat from './chat'
import Timer from './timer'
//actions
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
    toggleHighscores,
    setHighscores,
} from '../store/game/gameActions'
import {createSnackbar, closeSnackbar} from '../store/notify/notifyActions'
import {setChatHistory, setUserActivity} from '../store/chat/chatActions'
import {setUserName, setLoggedIn, setIsReady, showRules} from '../store/user/userActions'
//extras
import 'babel-polyfill' //to make async work with webpack
import * as config from '../config.json'
import {bindActionCreators} from 'redux'
import {client} from '..'
//styles & static
import logo from '../static/sudokuvs.png'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
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
    let {reqTypes} = config
    const attackSFX = () => {
        soundFxHandler('attack')
    }
    const newSnackBar = (text, actionText, type) => {
        console.log(type)
        if (type === 'error' | 'warning'){
            soundFxHandler('error')
        }else{
            soundFxHandler('general')
        }
        props.createSnackbar({
            message: text,
            options: {
                key: ` ${new Date().getTime() + Math.random()}` ,
                variant: type,
            },
        })
    }
    useEffect(() => {
        let index = props.userActivity.length - 1
        if (index != -1) {
            newSnackBar(props.userActivity[index], 'nice', 'info')
        }
    }, [props.userActivity])
    ////// Websocket functions start///////////////////
    client.onopen = () => {
        sendMessage(null, null, 'ready') //tell srv we're ready
        console.log('%cWebSocket Client Connected to server\n\n')
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
        let index
        let newestActivity
        let attack
        switch (dataFromServer.type) {
        case reqTypes.INFO:
            if (dataFromServer.players) {
                props.setAllPlayers(dataFromServer.players)
            }
            if (dataFromServer.board) {
                props.setBoard(dataFromServer.board)
            }
            break
        case reqTypes.READYUP:
            props.setReady(true)
            props.setCooldown(false)
            soundFxHandler('music')
            break
        case reqTypes.TIME:
            props.setGameTime(dataFromServer.time)
            if(dataFromServer.time === 200){
                soundFxHandler('endgame')
            }
            break
        case reqTypes.USER_EVENT:
            console.log(
                `${props.user.tempName} local ... server ${dataFromServer.data.username}`,
            )
            index = dataFromServer.data.userActivity.length - 1
            newestActivity = [
                ...props.userActivity,
                dataFromServer.data.userActivity[index],
            ]
            props.setUserActivity(newestActivity)
            if (props.user.tempName === dataFromServer.data.username) {
                props.setUserName(dataFromServer.data.username)
                props.setLoggedIn(true)
                soundFxHandler('lobby')
            } else if (dataFromServer.data.username === 'UsrNameTaken') {
                newSnackBar(
                    'username already exists! sorry :c ',
                    'okay',
                    'warning',
                )
                props.setLoggedIn(false)
            }
            if (dataFromServer.data.playersReady > 0) {
                props.setAllPlayers(dataFromServer.data.playersReady)
            }
            break
        case reqTypes.RESET:
            index = dataFromServer.data.userActivity.length - 1
            newestActivity = [
                ...props.userActivity,
                dataFromServer.data.userActivity[index],
            ]
            soundFxHandler('reset')
            props.setUserActivity(newestActivity)
            props.setGameMove(undefined)
            break
        case reqTypes.GAME_MOVE:
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
                    soundFxHandler('input')
                    props.setOpponentMove(dataFromServer.data.gameField)
                }
            }
            break
        case reqTypes.SOLVE:
            let board = dataFromServer.data.gamefield
            let x = 0 
            for (let row in board) {
                console.count(board[row])
                let y = 0
                for (let cell in board[row]) {
                    let move = {
                        type: 'gamemove',
                        player: props.user.playerNumber,
                        username: props.user.userName,
                        input: board[row][cell],
                        inputPos: `cell${x}${y}`,
                    }
                    y++
                    client.send(JSON.stringify(move))
                }
                x++
            }
            break
        case reqTypes.ATTACK:
            index = dataFromServer.data.userActivity.length - 1
            newSnackBar(
                dataFromServer.data.userActivity[index],
                '(∩ᵔ ͜ʖᵔ)⊃━☆ﾟ.*',
                'warning',
            )
            attack = handleAttacks(dataFromServer)
            if (attack === config.attackTypes.COOL) {
                props.setCooldown(true)
                setTimeout(function() {
                    props.setCooldown(false)
                }, config.COOLDOWN)
                return
            }
            if (attack && attack.state ? attack.state : null) {
                if (
                    (attack.target === props.user.playerNumber) |
					(props.user.playerNumber === 'spectator')
                ) {
                    const attackSFxInterval = setInterval(attackSFX, 1500)
                    
                    switch (attack.type) {
                    case config.attackTypes.SHAKE:
                        props.setShake({
                            board:
									'shake-slow shake-constant shake-constant-hover',
                            cell: 'shake-freeze shake-crazy',
                        })
                        setTimeout(function() {
                            props.setShake({board: null, cell: null})
                            clearInterval(attackSFxInterval)
                        }, config.ATTACK_DURATION)
                        break
                    case config.attackTypes.BLACK:
                        props.setShake({board: 'black', cell: 'black'})
                        setTimeout(function() {
                            props.setShake({board: null, cell: null})
                            clearInterval(attackSFxInterval)
                        }, config.ATTACK_DURATION)
                        break
                    case config.attackTypes.MEME:
                        console.log(
                            '%c( ͡° ͜ʖ ͡°) getting Memes',
                            'color: green; font size:large;',
                        )
                        getDankMemes(props.setMemes)
                        setTimeout(function() {
                            props.setMemes(false)
                            clearInterval(attackSFxInterval)
                        }, config.ATTACK_DURATION)
                        break
                    case config.attackTypes.SWITCH:
                        clearInterval(attackSFxInterval)
                        break
                    }
                }
            }
            break
        case reqTypes.CHAT:
            props.setChatHistory([...dataFromServer.data.chat])
            soundFxHandler('chat')
            break
        case reqTypes.HIGHSCORE:
            props.setHighscores(dataFromServer.highscores)
            props.toggleHighscores()
            break
        case reqTypes.ENDGAME:
            props.setChatHistory([
                dataFromServer.data.userActivity[
                    dataFromServer.data.userActivity.length - 1
                ],
            ])
            break
        default:
            console.error('we didnt know how to pocess your request..')
            break
        }
    }
    ////// Websocket functions end///////////////////
    return (
        <div className="game">
            {!props.user.isLoggedIn ? (
                <Login />
            ) : (
                <ReactCSSTransitionGroup
                    transitionName="example"
                    transitionAppear={true}
                    transitionAppearTimeout={3500}
                    transitionEnter={false}
                    transitionLeave={false}>
                    <div>
                        {!props.ready && !isNaN(props.user.playerNumber) ? (
                            <GetReady
                                playerName={props.user.userName}
                                playerNumber={props.user.playerNumber}
                                isReady={props.user.isReady}
                                setIsReady={props.setIsReady}
                                showRules={(x)=>{props.showRules(x)}}
                                rules={props.user.showRules}
                            />
                        ) : (
                            console.log(props.ready)
                        )}
                        <Container>
                            <img className="logo" src={logo} />
                            <Timer />
                            {(props.ready) ?(
                                <ReactCSSTransitionGroup
                                    transitionName="count"
                                    transitionAppear={true}
                                    transitionLeave={true}>
                                    {(props.showCountDown)? (
                                        <CountingDown /> ): ''}
                                </ReactCSSTransitionGroup>)
                                : ('')}
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
                                            opponent
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Container>
                        <Container>
                            <Chat />
                            {props.showHighscores && (<Highscores closeHighscores={props.toggleHighscores} Highscores={props.Highscores}/>)}
					
                        </Container>
                    </div>
                </ReactCSSTransitionGroup>
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
        Highscores: state.game.highscores,
        showHighscores: state.game.showHighscores,
        showCountDown: state.game.showCountDown
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
            setIsReady,
            setChatHistory,
            setUserActivity,
            createSnackbar,
            closeSnackbar,
            toggleHighscores,
            setHighscores,
            showRules
        },
        dispatch,
    ),
})
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Game)