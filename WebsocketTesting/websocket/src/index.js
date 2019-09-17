import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import InputField from './InputField/InputField'
import Editor from './Editor/Editor'
import {w3cwebsocket as W3CWebSocket} from 'websocket'

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

const Application = () => {

	
	const [username, setUsername] = useState('testuser')
	const client = new W3CWebSocket('ws://192.168.100.211:8080')
	const [text, setText] = useState('start typing ')
	
	const registerUser = (userName)=> {
		let data = {
			userName
		}

		client.send(JSON.stringify({...data,
			type: "userevent"}))
	}

 const loginFunction = async () =>{
 	await registerUser()
	}

	const App = () => {
		let dataFromServer
		let newText = 'example'
		let currentText
		
			client.onopen = () => {
				console.log('WebSocket Client Connected to server')
			}

			client.onmessage = (message) => {
				//console.log(message)
				dataFromServer = JSON.parse(message.data)
				console.log('im RECIEVING parsed: ', dataFromServer)

				if (dataFromServer.type === 'contentchange') {
					//const newText = () => setText(...text, dataFromServer.data.editorContent)
					console.log('filling text wiht: ', dataFromServer.data.editorContent)
					//newText()
					currentText = newText.concat(dataFromServer.data.editorContent)
					console.log('text has value: ', currentText)
				}
			}
		

		return <Editor data={currentText} sendInput={(text) => sendInput(text)} registerUser={(usr)=> registerUser(usr)}/>
	}

	const sendInput = (props) => {
		
		let content= props
		if (props.data) {
			setText(props.data)
		}
		let data = JSON.stringify({
				type: 'contentchange',
				content: content,
				username: username
			})
		console.log('im sending', data)
		client.send(data)	
	}

	return <App />
}
//Render

ReactDOM.render(<Application />, document.getElementById('root'))