import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import store from './store'
import {DEV_ENV} from './config'
import Game from './containers/game'
import {w3cwebsocket as W3CWebSocket} from 'websocket'
import './static/index.css'
import csshake from 'csshake/dist/csshake.min.css'
export const client = new W3CWebSocket('ws://localhost:8080')

if (!DEV_ENV) {
	console.log = () => {
		/*i dont do anything*/
	}
	console.warn = () => {
		/*i dont do anything*/
	}
	console.error = () => {
		/*i dont do anything*/
	}
}

ReactDOM.render(<Provider store={store} > <Game /> </Provider>, document.getElementById('root'))