//Timer
import React, {useEffect, useState} from 'react';


export const Timer = (props) => {

	const [timer, setTimer] = useState(0)
	const[isActive, setIsActive] = useState(false)
if (props.timerStart) {setIsActive(true)}
	
useEffect(()=>{
	let interval

	if (isActive) {
		interval = setInterval(()=>{
			setTimer(timer => timer +1)
		},1000)

	}else if(!isActive && timer !== 0){
		clearInterval(interval)
	}
	return () => clearInterval(interval)
}, [isActive, timer])
let timerContent = timer + ' seconds'
//TODO timer function
	return (
		<div className="timer">
		{timerContent}
		</div>
		)
}

export default Timer