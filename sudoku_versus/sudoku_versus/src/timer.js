//Timer
import React from 'react'
import MyButton from './button'
export const Timer = (props) => {
	
	let timerContent = props.time + ' seconds'
	//TODO timer function
	return (<div>
		<div className="timer">{timerContent}</div>
		</div>
)
}

export default Timer