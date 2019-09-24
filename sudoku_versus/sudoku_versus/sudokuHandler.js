//sudokuHandler
const fetch = require('node-fetch')
const klsudoku = require('klsudoku')
export let currentBoard =[]//board as soon as players regenerate (replaces initialBoard)
	let puzzle
	let solution
	console.log(currentBoard)
	if (currentBoard.lenght <5 ) {
				let solverMask = [].concat(...currentBoard)
				solution = klsudoku.solve(solverMask)
			}
export const sudokuMaster = (sudoku) => {
		console.log('inside master')

	console.log(currentBoard)
		if (sudoku) {//COMPARING USER INPUt TO SOLUTION
			console.log('sudoku true')
			console.log(sudoku)
			console.log(solution)
			if (!solution) {
				if (currentBoard) {
				let solverMask = [].concat(...currentBoard)
				solution = klsudoku.solve(solverMask)
			}
			}
			for (let keyid in sudoku) {
				let key = keyid.replace('cell', '')
				let rowid = key[0]
				let cellid = key[1]
				let userInputValue = sudoku[keyid]
				let position = Number(rowid) * 9 + Number(cellid)
				console.log(position)
				console.log(
					`${userInputValue} verglichen mit  ${solution[position]}`
				)
				if (userInputValue !== solution[position]) {
					console.log('values wrong')
					return false
				}
			}
		} else {//GENERATING LOCAL SUDOKU
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
		return true
	}
//GET NEW BOARD FROM ONLINE API
	export const getBoard = (difficulty='easy') => {
		return fetch(
				`https://sugoku.herokuapp.com/board?difficulty=${difficulty}`
			)
				.then((response) => response.json())
				.then((json) => {
					currentBoard = json.board
					return json.board
				})
				.catch(e => sudokuMaster()) //fall back to local generator in case API goes OFFLINE
	}