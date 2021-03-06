export const setTempName = name => {
    return {
        type: 'SET_TEMP_NAME',
        payload: name
    }
}

export const setUserName = name => {
    return {
        type: 'SET_USER_NAME',
        payload: name
    }
}

export const setLoggedIn = login => {
    return {
        type: 'SET_LOGGED_IN',
        payload: login
    }
}

export const setPlayerN = number => {
    return {
        type: 'SET_PLAYER_N',
        payload: number
    }
}
export const setIsReady = ready => {
    return {
        type: 'SET_ISREADY',
        payload: ready
    }
}
export const showRules = payload => {
    return {
        type: 'SHOW_RULES',
        payload
    }
}
