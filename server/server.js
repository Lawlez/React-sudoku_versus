import {DEV_ENV} from '../config.js'
import WebSocket from './websocketNew'
export let json = {}
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
export let webSocket = new WebSocket()
webSocket.start()