//Button
import React from 'react'
import {makeStyles,Button} from '@material-ui/core'

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
    return (
        <Button
            className={classes.button}
            variant="contained"
            color={props.color}
            onClick={props.onClick}
            disabled={props.cooldown ? props.cooldown : props.disabled}
        >
            {props.text}
        </Button>
    )
}

export default MyButton