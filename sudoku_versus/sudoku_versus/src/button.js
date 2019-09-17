//Button
import React from 'react';

export const Button = (props) => {
 let classNames = 'button'
 if (props.extraclass) {classNames = `button ${props.extraclass}`}
return(
	<button className={classNames} onClick={props.onClick} >{props.text} </button>
	)
}

export default Button