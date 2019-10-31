import WebSocket from './websocketNew'
import * as CONFIG from '../src/config.json'
export let json = {}
if (!CONFIG.DEV_ENV) {
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
