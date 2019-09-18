//Chat
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import React from 'react'
import clsx from 'clsx'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import {makeStyles} from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles((theme) => ({
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1)
	},
	root: {
		width: '100%',
		maxWidth: 1300,
		minWidth: 500,
		backgroundColor: theme.palette.background.paper,
		position: 'relative',
		overflow: 'auto',
		maxHeight: 300
	},
	listSection: {
		backgroundColor: 'inherit'
	},
	ul: {
		backgroundColor: 'inherit',
		padding: 0
	}
}))

export const Chat = () => {
	const classes = useStyles()
	return (
		<Container maxWidth="sm">
			<Card>
				<CardContent>
					<Typography className={classes.title}>
						spectator Chat
					</Typography>
					<List className={classes.root} subheader={<li />}>
						{[0, 1, 2, 3, 4].map((sectionId) => (
							<li
								key={`section-${sectionId}`}
								className={classes.listSection}
							>
								<ul className={classes.ul}>
									<ListSubheader>{`Username${sectionId}`}</ListSubheader>
									{[0, 1, 2].map((item) => (
										<ListItem
											key={`item-${sectionId}-${item}`}
										>
											<ListItemText
												primary={`message ${item}`}
											/>
										</ListItem>
									))}
								</ul>
							</li>
						))}
					</List>
				</CardContent>
				<CardActions>
					<TextField
						id="outlined-search"
						label="chat with us!"
						type="search"
						className={classes.textField}
						margin="normal"
						variant="outlined"
					/>
					<Button size="large" variant="contained" color="secondary">
						send
					</Button>
				</CardActions>
			</Card>
		</Container>
	)
}
export default Chat