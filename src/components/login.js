//login component
import React from 'react'
import MyButton from './button'
const Login = (props) => {
	return (
		<div className="loginWrapper">
			<div className="loginInner">
				<input
					type="text"
					placeholder="username"
					onChange={(e) => props.handleUserInput(e.target.value)}
				/>
				<MyButton
					color="default"
					variant="contained"
					text="Start!"
					onClick={props.onSubmit}
				/>
				<br />
				<div>
					<input
						type="radio"
						className="playerSelect"
						name="player"
						value="spectator"
						onChange={(e) =>
							props.handlePlayerSelect(e.target.value)
						}
					/>
					<label>Join as a Spectator</label>
				</div>
			</div>
		</div>
	)
}
export default Login