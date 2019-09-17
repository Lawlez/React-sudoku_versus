//login component
import React from 'react'

const Login = (props) => {

	//TODO select player 1 or 2 or spectator mode
	return (
		<div className="loginWrapper">
			<div className="loginInner">
			
				<input
					type="text"
					//value={props.uName}
					onChange={(e) => props.handleUserInput(e.target.value)}
				/>
				<button onClick={props.onSubmit}> Submit </button>
				<br/>
				<input type="radio" className="playerSelect" name="player" value="1" onChange={(e) => props.handlePlayerSelect(e.target.value)}/> Player 1<br/>
				<input type="radio" className="playerSelect" name="player" value="2" onChange={(e) => props.handlePlayerSelect(e.target.value)}/> Player 2
			

				

			</div>
		</div>
	)
}
export default Login