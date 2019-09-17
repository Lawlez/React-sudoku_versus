	import React, {useState}from 'react'
	import InputField from '../InputField/InputField'
	export const Editor = (props) => {
		let data = props.data
		console.log('Editor recieves: ',props.data)
		
		const RenderUi = async (props) => {
			const [userName, setUserName] = useState(null)
			if (!userName) {
				let username = prompt('Please enter your Username', '')
				setUserName(username)
				await props.registerUser(username)
					
			}

			return (
				<div>
					<InputField value={props.data} sendInput={(text) => props.sendInput(text)}/>
					<TextBoard inhalt={props.data} />
					
				</div>
			)
		}
		const TextBoard = (props) => {
			return <div className="textAnzeige">{props.inhalt}</div>
		}

		return <RenderUi data={data} registerUser={(usr)=> props.registerUser(usr)} sendInput={(text) => props.sendInput(text)} />
	}
	
	export default Editor