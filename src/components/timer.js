//Timer
import React from 'react'
export const Timer = (props) => {
	let timerContent = props.time + ' seconds'
	return (
		<div>
			<div className="timer">{timerContent}</div>
		</div>
	)
}
export default Timer