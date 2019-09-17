import React, {useState} from 'react'

export const InputField = (props) => {
			return (
				<div>
					<input
						className="inputfield"
						type="text"
						name="textfield"
						value={props.value}
						onChange={(event) => props.sendInput(event.target.value)}
					/>
					<input type="submit" value="submit" />
				</div>
			)
		}
export default InputField