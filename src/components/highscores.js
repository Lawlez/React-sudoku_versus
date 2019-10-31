import React from 'react'
import {
    useTheme,
    useMediaQuery,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dialog,
    Button,
    TableCell,
    TableRow,
    TableHead,
    Table,
    TableBody,
    makeStyles,
} from '@material-ui/core'
const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(3),
        overflowX: 'auto',
        marginBottom: theme.spacing(2),
    },
}))
export const Highscores = (props) => {
    const classes = useStyles()
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    console.log(props.Highscores[3].username)
    let i = 1
    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                className={classes.paper}
                open={open}
                onClose={props.closeHighscores}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
					Highscores
                </DialogTitle>
                <DialogContent>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">Rank</TableCell>
                                <TableCell align="right">Username</TableCell>
                                <TableCell align="right">Highscore</TableCell>
                                <TableCell align="right">Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.Highscores.map((row) => (
                                <TableRow key={row.username}>
                                    <TableCell component="th" scope="row">
                                        {i++}
                                    </TableCell>
                                    <TableCell>{row.username}</TableCell>
                                    <TableCell align="right">
                                        {row.highscore}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.time}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={props.closeHighscores}
                        color="primary"
                        autoFocus
                    >
						Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
export default Highscores
