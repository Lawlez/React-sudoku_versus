//////////config file////////
//default chat msg
export const defaultChatMsg = [
	'Server: Hey Players 👋,The game starts when both players joined & you type /start in the chat. Your field is the blue one. To fill in a field simply click it and start typing, players have the option to reset their own field.',
	'Server: Hey Spectators! 🤩 Attacks are selected at random and will be launched at both players & become available after a time delay. F in the chat guys'
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
	READY: 'ready'
}
export const attackTypes = {
	SHAKE: 'shakes the playfield',
	BLACK: 'People like Darkmode right?',
	SWITCH: 'switches playfield values',
	COOL: 'onCooldown',
	MEME: 'display distracting memes & gifs',
}

export const DEV_ENV = true