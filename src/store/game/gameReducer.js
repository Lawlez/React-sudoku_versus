const gameReducer = (
    state = {
        fieldInput: {},
        opponentFields: {},
        board: [],
        allPlayers: 0,
        time: 0,
        cooldown: true,
        shake: {board: null, cell: null},
        memes: false,
        ready: false,
        highscores: [],
        showHighscores: false,
        countDownNumber: 3,
        showCountDown: true
    },
    action,
) => {
    switch (action.type) {
    case 'SET_GAME_MOVE':
        state = {
            ...state,
            fieldInput: {...action.payload},
        }
        break
    case 'SET_OPPONENT_MOVE':
        state = {
            ...state,
            opponentFields: {...action.payload},
        }
        break
    case 'SET_ALL_PLAYERS':
        state = {
            ...state,
            allPlayers: action.payload,
        }
        break
    case 'SET_GAME_TIME':
        state = {
            ...state,
            time: action.payload,
        }
        break
    case 'SET_BOARD':
        state = {
            ...state,
            board: [...action.payload],
        }
        break
    case 'SET_COOLDOWN':
        state = {
            ...state,
            cooldown: action.payload,
        }
        break
    case 'SET_SHAKE':
        state = {
            ...state,
            shake: {board: action.payload.board, cell: action.payload.cell},
        }
        break
    case 'SET_MEMES':
        state = {
            ...state,
            memes: action.payload,
        }
        break
    case 'SET_READY':
        state = {
            ...state,
            ready: action.payload,
        }
        break
    case 'TOGGLE_HIGHSCORES':
        state = {
            ...state,
            showHighscores: !state.showHighscores,
        }
        break
    case 'SET_HIGHSCORES':
        state = {
            ...state,
            highscores: [...action.payload],
        }
        break
    case 'COUNTDOWN':
        if (state.countDownNumber > 1){ 
            state = {
                ...state,
                countDownNumber: action.payload
            }
        } else {
            state = {
                ...state,
                showCountDown: false
            }
        }
        break
    default:
        return state
    }
    return state
}
export default gameReducer
