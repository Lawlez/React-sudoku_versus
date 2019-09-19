//Chat
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Send from '@material-ui/icons/Send'
import React, {useState, useEffect} from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import {makeStyles} from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles((theme) => ({
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: '100%'
	},
	root: {
		width: '100%',
		maxWidth: 1300,
		minWidth: 500,
		backgroundColor: theme.palette.background.paper,
		position: 'relative',
		overflow: 'auto',
		maxHeight: 220,
		minHeight:220
	},
	listSection: {
		backgroundColor: 'inherit'
	},
	ul: {
		backgroundColor: 'inherit',
		padding: 0
	},
	button: {
		margin: theme.spacing(1),
		padding: theme.spacing(1.5)
	},
	fab: {
		margin: theme.spacing(1)
	}
}))

export const Chat = (props) => {
	const [userMessage, setUserMessage] = useState()
	const [messageHistory, setMessageHistory] = useState(props.history)
	const classes = useStyles()
	console.log('message history:', messageHistory)

	useEffect(() => {
		setMessageHistory(props.history)
	}, [props])

	const hstryLength = () =>{
		return props.history.length
	}
	const handleChatMessage = (e) => {
		if (!userMessage) {return console.log('message cannot be emtpy')}
		//setMessageHistory([`${usr}: ${userMessage}`, ...messageHistory])
		
		props.onMessage(userMessage)
		setUserMessage('')
	}
	const handleEnterMessage = (e) => {
		if (e.keyCode === 13 || e.which === 13) {
		handleChatMessage()
	}

	}
	console.log(props.history)
	return (
		<Container maxWidth="md">
			<Card>
				<CardContent>
					<Typography className={classes.title}>
						spectator Chat
					</Typography>
					<List className={classes.root}>
						
									{props.history.map((item) => ( 
										<ListItem
											key={`item${hstryLength()*Math.random()}-${item}${hstryLength()}`}
										>
											<ListItemText
												primary={`${item}`}
											/>
										</ListItem>
						
						))}
					</List>
				</CardContent>
				<CardActions>
					<TextField
						id="outlined-text"
						label="chat with us!"
						type="text"
						className={classes.textField}
						margin="normal"
						variant="outlined"
						value={userMessage}
						
						onChange={(e) => setUserMessage(e.target.value)}
						onKeyPress={(e) => handleEnterMessage(e)}
					/>
					<Button
						size="large"
						variant="outlined"
						color="secondary"
						aria-label="send"
						className={classes.button}
						onClick={(e) => handleChatMessage()}
					>
						<Send />
					</Button>
				</CardActions>
			</Card>
		</Container>
	)
}

export default Chat