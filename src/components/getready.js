//Timer
import React from 'react'
import MyButton from './button'
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Dialog,
    DialogContentText,
    TableCell,
    Paper,
    TableBody,
    TableRow,
    Table,
    TableHead
} from '@material-ui/core'
import { sendMessage } from '../containers/handlers'
export const GetReady = props => {
    const imReady = () => {
        sendMessage(null, props.playerNumber, 'readyup', 'Player is ready')
        props.setIsReady(true)
    }
    return (
        <div>
            <Dialog
                open={open}
                className="getReady"
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
          Welcome Stranger!
                </DialogTitle>
                <DialogContent>
                    {props.isReady ? (
                        <DialogContent>
                            <DialogContentText>
                Please wait for at least one more player. The game will start as
                soon as all Players ready up. In the meantime, why not check the
                rules below?
                            </DialogContentText>
                        </DialogContent>
                    ) : (
                        <DialogContent>
                            <DialogContentText>
                Welcome! when you are ready to play please &apos;ready up&apos;
                below, when all players are ready the game will start.
                            </DialogContentText>
                        </DialogContent>
                    )}
                </DialogContent>
                <DialogActions>
                    <MyButton
                        color="secondary"
                        onClick={() => {
                            props.showRules(true)
                        }}
                        text="Read the rules"
                    />
                    <MyButton
                        color="primary"
                        onClick={imReady}
                        disabled={props.isReady}
                        text="Ready Up!"
                    />
                </DialogActions>
            </Dialog>
            <Dialog open={props.rules} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">How To Play</DialogTitle>
                <DialogContent>
                    <DialogContentText>
            Sudoku Versus is a multiplayer version of the classic Sudoku game.
            There are 2 players who compete against eachother to get the best
            score in the shortest time. Spectators can also join the lobby and
            distract the players with various attacks.
                    </DialogContentText>
                </DialogContent>
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell string>chat command</TableCell>
                                <TableCell string>effect</TableCell>
                                <TableCell string>special</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key="nwbrd">
                                <TableCell component="th" scope="row">
                  newboard (easy | medium | hard)
                                </TableCell>
                                <TableCell string>
                  request a new Board from the server
                                </TableCell>
                                <TableCell string>
                  only players can do this, default board is &apos;easy&apos;
                                </TableCell>
                            </TableRow>
                            <TableRow key="hgscre">
                                <TableCell component="th" scope="row">
                  highscore
                                </TableCell>
                                <TableCell string>
                  displays the current top 10 Highscores
                                </TableCell>
                                <TableCell string>-</TableCell>
                            </TableRow>
                            <TableRow key="atck">
                                <TableCell component="th" scope="row">
                  /attack
                                </TableCell>
                                <TableCell string>
                  Launches a random attack against one of the players.
                                </TableCell>
                                <TableCell string>
                  only spectators can use this command, 30s cooldown
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
                <DialogActions>
                    <MyButton
                        color="primary"
                        onClick={() => {
                            props.showRules(false)
                        }}
                        text="close"
                    />
                </DialogActions>
            </Dialog>
        </div>
    )
}
export default GetReady
