//activity handler
export let userActivity = []
export const activityHandler = (activity) =>{	
	userActivity = [...userActivity, activity]
	return userActivity
}
export default activityHandler