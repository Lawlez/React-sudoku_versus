import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import Game from './containers/game'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import './static/index.css'
import 'csshake/dist/csshake.min.css'
import { SnackbarProvider } from 'notistack'
import { soundFxHandler } from './containers/handlers'
import Notifier from './containers/notifier.js'
import * as config from './config.json'
export const client = new W3CWebSocket(config.WEBSOCKET_URL)

if (!config.DEV_ENV) {
    console.log = () => {
    /*i dont do anything*/
    }
    console.warn = () => {
    /*i dont do anything*/
    soundFxHandler('error')
    }
    console.error = () => {
    /*i dont do anything*/
    soundFxHandler('error')
    }
    console.table = () => {
    /*i dont do anything*/
    }
    console.count = () => {
    /*i dont do anything*/
    }
}

ReactDOM.render(
    <Provider store={store}>
        <SnackbarProvider
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
            }}
            maxSnack={3}
            dense
        >
            <Notifier /> <Game />
        </SnackbarProvider>
    </Provider>,
    document.getElementById('root')
)
