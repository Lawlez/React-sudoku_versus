const chatReducer = (
    state = {
        userActivity: [],
        chatHistory: [],
        chatMessage: '',
        showEmojis: false,
    },
    action,
) => {
    switch (action.type) {
    case 'SET_USER_ACTIVITY':
        state = {
            ...state,
            userActivity: action.payload,
        }
        break
    case 'SET_CHAT_HISTORY':
        state = {
            ...state,
            chatHistory: action.payload,
        }
        break
    case 'SET_CHAT_MESSAGE':
        state = {
            ...state,
            chatMessage: action.payload,
        }
        break
    case 'SHOW_EMOJIS':
        state = {
            ...state,
            showEmojis: !state.showEmojis,
        }
        break
    case 'ADD_EMOJI':
        state = {
            ...state,
            chatMessage: state.chatMessage + action.payload
        }
        break
    default:
        return state
    }
    return state
}
export default chatReducer
