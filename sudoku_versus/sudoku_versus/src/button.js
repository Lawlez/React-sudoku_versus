//Button
import React from 'react'
import Button from '@material-ui/core/Button'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		color: theme.palette.text.secondary
	},
	button: {
		margin: theme.spacing(1)
	}
}))

export const MyButton = (props) => {
	const classes = useStyles()
	let classNames = 'button'
	if (props.extraclass) {
		classNames = `button ${props.extraclass}`
	}
	return (
		<Button
			className={classes.button}
			variant="contained"
			color={props.color}
			onClick={props.onClick}
		>
			{props.text}
		</Button>
	)
}

export default MyButton