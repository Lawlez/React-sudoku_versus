//sudokuHandler
import {webSocket} from './server'
import {activityHandler, userActivity} from './activityHandler'
const fetch = require('node-fetch')
const klsudoku = require('klsudoku')
export let currentBoard = [] //board as soon as players regenerate (replaces initialBoard)
let puzzle
let solution

export const getSolution = (getBoard = null) => {
	let solverMask = [].concat(...currentBoard)
	solverMask = solverMask.toString()
	solverMask = solverMask.replace(/,/g, '')
	console.log(solverMask)
	solution = klsudoku.solve(solverMask)
	solution = solution.solution
	if (getBoard) {
		let tiles = solution.match(/.{1,9}/g)
		let board = tiles.map((tile) => tile.split('').map((t) => Number(t)))
		return board
	} else {
		return solution
	}
}

export const sudokuMaster = (sudoku) => {
	//>>>works
	console.log('inside master')
	if (Object.keys(sudoku).length > 0) {
		console.log('sudoku true')
		console.log(sudoku)
		if (solution === undefined) {
			solution = getSolution()
		}
		let corrVals = 0
		for (let keyid in sudoku) {
			let key = keyid.replace('cell', '')
			let rowid = key[0]
			let cellid = key[1]
			let userInputValue = sudoku[keyid]
			let position = Number(rowid) * 9 + Number(cellid)
			console.log(
				`${userInputValue} verglichen mit  ${solution.charAt(position)}`
			)
			console.log(
				Number(userInputValue) === Number(solution.charAt(position))
			)
			if (Number(userInputValue) !== Number(solution.charAt(position))) {
				console.warn('values wrong')
				return 'aww i´m sorry to tell you but this aint correct..'
			}
			corrVals++
		}
		if (corrVals < 40) {
			return 'all entered values correct. finish it!'
		}} else {return 'did you even solve anything? nice try..'
	}
	return true
}
const getLocalBoard = ()=>{//FALLBACK if API is down
	let result = klsudoku.generate()
	console.log(result)
	puzzle = result.puzzle
	solution = result.solution
	result = klsudoku.solve(puzzle)
	let tiles = puzzle.match(/.{1,9}/g)
	let board = tiles.map((tile) =>
		tile.split('').map((t) => (t === '.' ? null : Number(t)))
	)
	return board
}
//GET NEW BOARD FROM ONLINE API
export const getBoard = (difficulty = 'easy') => {
	//>>>works
	return fetch(`https://sugoku.herokuapp.com/board?difficulty=${difficulty}`)
		.then((response) => response.json())
		.then((json) => {
			currentBoard = json.board
			return json.board
		})
		.catch(() => getLocalBoard()) //fall back to local generator in case API goes OFFLINE
}
export const endGame = (
	dataFromClient
) => {
	let json = {type:'endgame'}
	let gameField1 = webSocket.getClientByType('player', 1)
	let gameField2 = webSocket.getClientByType('player', 2)
	let player1Win = (gameField1 && gameField1.moves) ? sudokuMaster(gameField1.moves) : 'board is empty.. booohoo'
	let player2Win = (gameField2 && gameField2.moves) ? sudokuMaster(gameField2.moves) : 'board is empty..'
	if (player2Win === true) {
		activityHandler('Player 2 has WON the game!🥳 Congratulations!')
	} else if (player1Win === true) {
		activityHandler('Player 1 has WON the game!🥳 Congratulations!')
	} else {
		activityHandler(
			`Guys 🙄 nobody filled the board correctly.. Player1:${player1Win} Player2:${player2Win}, how dare you submit wrong answers @Player ${dataFromClient.player}? now deal with this🤷💀 `
		)
		webSocket.punish(dataFromClient.player)
	}
	json.data = {
		player: dataFromClient.player,
		player1: player1Win,
		player2: player2Win,
		userActivity
	}
	webSocket.sendMessage(json)

}