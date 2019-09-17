//Board
import React from 'react'
import NewSquare from './square'
const RenderBoard = (props) => {
	//component
	//renderBoard is responsible to draw the playfield
	let rows = []
	let size = 9
	for (let i = 0; i < size; i++) {
		let rowID = `row${i}`
		let square = []
		for (let id = 0; id < size; id++) {
			let cellID = `cell${i}${id}`
			let cellVal = props.fields(i, id)

			square.push(
				<NewSquare
					handleUserInput={(e) => props.handleUserInput(e, cellID)}
					opponent={props.opponent}
					opponentValues={
						props.opponentFields && props.opponentFields[cellID]
					}
					inputValue={props.inputValues && props.inputValues[cellID]}
					key={cellID}
					value={cellVal}
				/>
			)
		}

		rows.push(
			<div key={rowID} className="row">
				{square}
			</div>
		)
	}
	return <div>{rows}</div>
}

export default RenderBoard