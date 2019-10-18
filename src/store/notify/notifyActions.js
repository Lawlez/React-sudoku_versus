export const CREATE_SNACKBAR = 'CREATE_SNACKBAR'
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR'
export const REMOVE_SNACKBAR = 'REMOVE_SNACKBAR'

export const createSnackbar = notification => {
	//const key = notification.options && notification.options.key

	return {
		type: CREATE_SNACKBAR,
		notification: {
			...notification,
			key: /*key ||*/ new Date().getTime() + Math.random(),
		},
	}
}

export const closeSnackbar = key => ({
	type: CLOSE_SNACKBAR,
	dismissAll: !key, // dismiss all if no key has been defined
	key,
})

export const removeSnackbar = key => ({
	type: REMOVE_SNACKBAR,
	key,
})
