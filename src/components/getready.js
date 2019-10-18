//Timer
import React from 'react'
import MyButton from './button'
import {sendMessage} from '../containers/handlers'
export const GetReady = (props) => {
	const imReady = () => {
		sendMessage(null,props.playerNumber, 'readyup','Player is ready')
	}
	return (
		<div className="getReady">
			<div className="readyBtn"><MyButton color="primary" onClick={imReady} text="Ready Up!"/></div>
		</div>
	)
}
export default GetReady