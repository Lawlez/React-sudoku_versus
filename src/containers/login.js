//login component
import React from 'react'
import MyButton from '../components/button'
import { setTempName, setPlayerN } from '../store/user/userActions'
import { connect } from 'react-redux'
import { onSubmit } from './handlers'
import { bindActionCreators } from 'redux'
const Login = (props) => {
	return (
		<div className="loginWrapper">
			<div className="loginInner">
				<input
					type="text"
					placeholder="username"
					onChange={(e) => props.setTempName(e.target.value)}
				/>
				<MyButton
					color="default"
					variant="contained"
					text="Start!"
					onClick={() => onSubmit(
						props.user.playerNumber,
						props.user.tempName,
						props.allPlayers,
						props.setPlayerN,
					)}
					cooldown={props.user.tempName ? false : true}
					
				/>
				<br />
				<div>
					<input
						type="radio"
						className="playerSelect"
						name="player"
						value="spectator"
						onChange={(e) =>
							props.setPlayerN(e.target.value)
						}
					/>
					<label>Join as a Spectator</label>
				</div>
			</div>
		</div>
	)
}
const mapStateToProps = (state) => {
	return {
		user: state.user,
		allPlayers: state.game.allPlayers
	}
}

const mapDispatchToProps = dispatch => ({
	...bindActionCreators(
		{
			setTempName,
			setPlayerN,
		},
		dispatch,
	)})
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Login)