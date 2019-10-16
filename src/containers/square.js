//Square
import React from 'react'
import InputField from '../components/inputfield'
import { connect } from 'react-redux'
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
					{props.opponentFields && props.opponentFields[props.keys] ? (
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
						props.opponentFields && props.opponentFields[props.keys] ? (
							<span className="poo" role="img" aria-label="poo">
								💩
							</span>
						) : null
					) : props.fields && props.fields[props.keys] ? (
						<span className="poo" role="img" aria-label="poo">
							💩
						</span>
					) : null}
				</div>
			)
		} else {
			field = (
				<InputField
					value={props.fields && props.fields[props.keys]}
					deleteValue={() => props.deleteValue()}
					onCorrectInput={(value) => props.handleUserInput(value)}
				/>
			)
		}
	}
	return <div className={'squareWrapper ' + props.shake}>{field}</div>
}
const mapStateToProps = (state, ownProps) => {
	return {
		player: state.user.playerNumber,
		opponentFields: state.game.opponentFields,
		fields: state.game.fieldInput,
		opponent: ownProps.opponent,
		value: ownProps.value,
		keys: ownProps.id,
		shake: state.game.shake.cell
	}
}

export default connect(
	mapStateToProps,
)(NewSquare)