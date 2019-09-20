//Board
import React from 'react'
import NewSquare from './square'
import {fields} from './index'
const RenderBoard = (props) => {
	let inputValues = {
		...props.inputValues
	}
	//component
	//renderBoard is responsible to draw the playfield
	let rows = []
	let size = 9
	for (let i = 0; i < size; i++) {
		let rowID = `row${i}`
		let square = []
		for (let id = 0; id < size; id++) {
			let cellID = `cell${i}${id}`
			let cellVal = props.fields[i][id]
			square.push(
				<NewSquare
					handleUserInput={(e) => props.handleUserInput(e, cellID)}
					opponent={props.opponent}
					opponentValues={
						props.opponentFields && props.opponentFields[cellID]
					}
					inputValue={
						inputValues &&
						Object.keys(inputValues).length > 0 &&
						inputValues[cellID]
							? inputValues[cellID]
							: ''
					}
					key={cellID}
					value={cellVal}
					player={props.player}
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