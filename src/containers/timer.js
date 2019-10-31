//Timer
import React from 'react'
import { connect } from 'react-redux'
export const Timer = props => {
    let timerContent = props.time - 3 <= 0 ? 0 : props.time - 3 + ' seconds'
    return (
        <div>
            <div className="timer">{timerContent}</div>
        </div>
    )
}
const mapStateToProps = state => {
    return {
        time: state.game.time
    }
}
export default connect(
    mapStateToProps,
    {}
)(Timer)
