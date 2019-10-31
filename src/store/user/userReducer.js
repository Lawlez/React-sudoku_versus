const userReducer = (
    state = {
        isLoggedIn: false,
        userName: null,
        tempName: null,
        playerNumber: null,
        isReady: false,
        showRules: false
    },
    action
) => {
    switch (action.type) {
    case 'SET_TEMP_NAME':
        state = {
            ...state,
            tempName: action.payload
        }
        break
    case 'SET_USER_NAME':
        state = {
            ...state,
            userName: action.payload
        }
        break
    case 'SET_LOGGED_IN':
        state = {
            ...state,
            isLoggedIn: action.payload
        }
        break
    case 'SET_PLAYER_N':
        state = {
            ...state,
            playerNumber: action.payload
        }
        break
    case 'SET_ISREADY':
        state = {
            ...state,
            isReady: action.payload
        }
        break
    case 'SHOW_RULES':
        state = {
            ...state,
            showRules: action.payload
        }
        break
    default:
        return state
    }
    return state
}

export default userReducer
