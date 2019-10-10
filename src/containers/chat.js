//Chat
import React, { useEffect} from 'react'
import { connect } from 'react-redux'
import { setChatHistory, setChatMessage } from '../store/chat/chatActions'
import {
	ListItemText,
	CardActions,
	CardContent,
	Typography,
	TextField,
	makeStyles,
	Container,
	ListItem,
	List,
	Card
} from '@material-ui/core'
import {sendChatMessage} from './handlers'
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
		minHeight: 220
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
	//const [userMessage, setUserMessage] = useState('')
	const classes = useStyles()

	useEffect(() => {
		autoScroll('chat')
	}, [props])

	const autoScroll = (id) => {
		let element = document.getElementById(id)
		element.scrollTop = element.scrollHeight
	}

	const hstryLength = () => {
		return props.chat.chatHistory.length
	}
	const handleChatMessage = () => {
		if (!props.chat.chatMessage) {
			return console.warn('message cannot be emtpy')
		}
		sendChatMessage(props.chat.chatMessage, props.userName, props.playerN)
		props.setChatMessage('')
	}
	const handleEnterMessage = (e) => {
		if (e.keyCode === 13 || e.which === 13) {
			handleChatMessage()
		}
	}
	return (
		<Container maxWidth="md">
			<Card>
				<CardContent>
					<Typography className={classes.title}>
						spectator Chat
					</Typography>
					<List className={classes.root} id="chat">
						{props.chat.chatHistory.map((item) => (
							<ListItem
								key={`item${hstryLength() *
									Math.random()}-${item}${hstryLength()}`}
							>
								<ListItemText primary={`${item}`} />
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
						value={props.chat.chatMessage}
						onChange={(e) => props.setChatMessage(e.target.value)}
						onKeyPress={(e) => handleEnterMessage(e)}
					/>
				</CardActions>
			</Card>
		</Container>
	)
}
const mapStateToProps = (state) => {
	return {
		chat: state.chat,
		userName: state.user.userName,
		playerN: state.user.playerNumber
	}
}
const mapDispatchToProps = (dispatch) => {
	return {
		setChatHistory: (history) => {
			dispatch(setChatHistory(history))
		},
		setChatMessage: (activity) => {
			dispatch(setChatMessage(activity))
		},
	}
}
export default connect(mapStateToProps,mapDispatchToProps)(Chat)