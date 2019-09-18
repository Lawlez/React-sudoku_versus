//Button
import React from 'react';
import Button from '@material-ui/core/Button';

export const MyButton = (props) => {
 let classNames = 'button'
 if (props.extraclass) {classNames = `button ${props.extraclass}`}
return(
	<Button className={classNames} variant="contained" color={props.color} onClick={props.onClick} >{props.text} </Button>
	)
}

export default MyButton