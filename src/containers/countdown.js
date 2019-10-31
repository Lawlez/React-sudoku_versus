import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { countDown } from '../store/game/gameActions'
export const CountingDown = props => {
    let counter
    const count = () => {
        if (props.CountDownNumber > 0 && props.showCountDown) {
            props.countDown(props.CountDownNumber - 1)
            clearCountDown()
        } else {
            clearCountDown()
        }
    }

    if (props.showCountDown === true) {
        clearInterval(counter)
        counter = setInterval(count, 1300)
        console.count('countdowninterval')
    }else if (props.CountDown <= 1) {
        clearInterval(counter)
        console.count('reset interval')
    }
    const clearCountDown = () => {
        clearInterval(counter)
        console.count('reset interval 11')
    }
    return (
        props.showCountDown && (
            <div className="countdown">{props.CountDownNumber}</div>
        )
    )
}
const mapStateToProps = state => {
    return {
        CountDownNumber: state.game.countDownNumber,
        showCountDown: state.game.showCountDown
    }
}
const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(
        {
            countDown
        },
        dispatch
    )
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CountingDown)
