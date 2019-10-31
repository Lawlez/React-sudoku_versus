export const setGameMove = move => {
    return {
        type: 'SET_GAME_MOVE',
        payload: move
    }
}
export const setOpponentMove = move => {
    return {
        type: 'SET_OPPONENT_MOVE',
        payload: move
    }
}
export const setAllPlayers = players => {
    return {
        type: 'SET_ALL_PLAYERS',
        payload: players
    }
}
export const setGameTime = time => {
    return {
        type: 'SET_GAME_TIME',
        payload: time
    }
}
export const setBoard = board => {
    return {
        type: 'SET_BOARD',
        payload: board
    }
}
export const setCooldown = cooldown => {
    return {
        type: 'SET_COOLDOWN',
        payload: cooldown
    }
}
export const setShake = shake => {
    return {
        type: 'SET_SHAKE',
        payload: shake
    }
}
export const setMemes = memes => {
    return {
        type: 'SET_MEMES',
        payload: memes
    }
}
export const setReady = ready => {
    return {
        type: 'SET_READY',
        payload: ready
    }
}
export const setHighscores = highscores => {
    return {
        type: 'SET_HIGHSCORES',
        payload: highscores
    }
}
export const toggleHighscores = () => {
    return {
        type: 'TOGGLE_HIGHSCORES'
    }
}
export const countDown = count => {
    return {
        type: 'COUNTDOWN',
        payload: count
    }
}