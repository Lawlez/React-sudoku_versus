//Square
import React from 'react';
import InputField from './inputfield'
export const NewSquare = (props) => {
	let field
	if (props.value) {
		field = <InputField type="text" value={props.value} readOnly extraClass="immutable"/>
	}
	else{
		if (props.opponent){
		field = <div className="square opponent">{(props.opponentValues) ? <span class="poo">💩</span> : null}</div>
	}else{ 
		field = <InputField  value={props.inputValue} onCorrectInput={(value) =>  props.handleUserInput(value)} />
	}
	}

	return(
		<div className="squareWrapper">
		{field}
		</div>
		)
}
export default NewSquare