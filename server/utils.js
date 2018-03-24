import moment from 'moment'

export default {
	getLatestTradingDate: () => {
		var latestTradingDate = moment()
		while(latestTradingDate.format('d') == 0 || latestTradingDate.format('d') == 6) {
			latestTradingDate = latestTradingDate.subtract(1, 'day')
		}
		return latestTradingDate
	},
}