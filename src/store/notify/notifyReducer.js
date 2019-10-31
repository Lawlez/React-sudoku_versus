import {CREATE_SNACKBAR, CLOSE_SNACKBAR, REMOVE_SNACKBAR} from './notifyActions'

const initialState = {
    notifications: [],
}

export default (state = initialState, action) => {
    switch (action.type) {
    case CREATE_SNACKBAR:
        return {
            ...state,
            notifications: [
                ...state.notifications,
                {
                    key: action.key,
                    ...action.notification,
                },
            ],
        }
    case CLOSE_SNACKBAR:
        return {
            ...state,
            notifications: state.notifications.map((notification) =>
                action.dismissAll || notification.key === action.key
                    ? {...notification, dismissed: true}
                    : {...notification},
            ),
        }

    case REMOVE_SNACKBAR:
        return {
            ...state,
            notifications: state.notifications.filter(
                (notification) => notification.key != action.key,
            ),
        }
    default:
        return state
    }
}
