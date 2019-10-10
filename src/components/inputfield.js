import React, {useEffect, useState} from 'react'

const InputField = (props) => {
	const [value, setValue] = useState(props.value)

	useEffect(() => {
		setValue(props.value)
	}, [props])
	const checkValue = (input) => {
		if (input === '') {
			setValue('')
			console.log('deleted value')
			props.deleteValue()
		}
		if (input) {
			if (isNaN(input)) {
				//check if input is a number
				console.error('Bitte Geben Sie eine ZAHL ein')
				setValue('')
				return
			}
			if (input.toString().length > 1) {
				//check if input is single digit
				console.error('Bitte Geben Sie eine einstellige zahl ein')
				setValue('')
				return
			}
			if (input > 9 || input === 0) {
				console.error('Bitte Geben Sie eine zahl zwischen 1 und 9 ein')
				setValue('')
				return
			}
			setValue(input)
			props.onCorrectInput(Number(input))
		}
	}
	return (
		<input
			type="text"
			readOnly={props.readOnly}
			className={`square ${props.extraClass}`}
			value={value ? value : ''}
			onChange={(e) => checkValue(e.target.value)}
		/>
	)
}
export default InputField