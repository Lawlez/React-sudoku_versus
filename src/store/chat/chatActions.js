export const setUserActivity = activity => {
    return {
        type: 'SET_USER_ACTIVITY',
        payload: activity
    }
}

export const setChatHistory = history => {
    return {
        type: 'SET_CHAT_HISTORY',
        payload: history
    }
}

export const setChatMessage = message => {
    return {
        type: 'SET_CHAT_MESSAGE',
        payload: message
    }
}
export const addEmoji = payload => ({
    type: 'ADD_EMOJI',
    payload
})
export const showEmojis = payload => ({
    type: 'SHOW_EMOJIS',
    payload
})
