//////////SERVER_SIDE config file////////
//default chat msg
export const defaultChatMsg = [
	'Server: Hey Players 👋,The game starts when both players joined. Your field is the blue one. To fill in a field simply click it and start typing, players have the option to reset their own field.',
	'Server: Hey Spectators! 🤩 Attacks are selected at random and will be launched at a random player & they become available after a time delay. F in the chat guys'
]
//request types, currently only used serverside TODO clientside
export const reqTypes = {
	//defining user request types
	USER_EVENT: 'userevent',
	GAME_MOVE: 'gamemove',
	ATTACK: 'attack',
	RESET: 'resetgame',
	CHAT: 'chat',
	ENDGAME: 'endgame',
	READY: 'ready',
	READYUP: 'readyup'
}

export const attackTypes = {
	BLACK: 'People like Darkmode right?',
	SHAKE: 'shakes the playfield',
	SWITCH: 'switches playfield values',
	MEME: 'display distracting memes & gifs',
}

export const DEV_ENV = true //set to false to turn off logging
export const COOLDOWN = 2000 //in ms
export const SRV_PORT = 80
export const INITIAL_BOARD = 'easy' //set diff of default board
export const ATTACK_DURATION = 2000 //how long attacks last in ms
export const HIGHSCORE_FILE = 'server/logs/Highscore.list'  //where highscores are saved
export const SCORE_EQUATION = '(score / time) * score * 100'//inside srvHelpers  