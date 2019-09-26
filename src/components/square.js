//Square
import React from 'react'
import InputField from './inputfield'
export const NewSquare = (props) => {
	let field
	if (props.value) {
		field = (
			<InputField
				type="text"
				value={props.value}
				readOnly
				extraClass="immutable"
			/>
		)
	} else {
		if (props.opponent) {
			field = (
				<div className="square opponent">
					{props.opponentValues ? (
						<span className="poo" role="img" aria-label="poo">
							💩
						</span>
					) : null}
				</div>
			)
		} else if (props.player === 'spectator') {
			field = (
				<div className="square  opponent">
					{' '}
					{props.opponent ? (
						props.opponentValues ? (
							<span className="poo" role="img" aria-label="poo">
								💩
							</span>
						) : null
					) : props.inputValue ? (
						<span className="poo" role="img" aria-label="poo">
							💩
						</span>
					) : null}
				</div>
			)
		} else {
			field = (
				<InputField
					value={props.inputValue}
					deleteValue={() => props.deleteValue()}
					onCorrectInput={(value) => props.handleUserInput(value)}
				/>
			)
		}
	}
	return <div className="squareWrapper">{field}</div>
}
export default NewSquare