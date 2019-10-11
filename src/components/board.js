//Board
import React from 'react'
import NewSquare from '../containers/square'
const RenderBoard = (props) => {
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
					deleteValue={() => props.deleteValue(cellID)}
					handleUserInput={(e) => props.handleUserInput(e, cellID)}
					opponent={props.opponent}
					id={cellID}
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