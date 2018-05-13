import moment from 'moment'
import csvHeaders from './CsvHeaders'

export default {
	// returns moment date of latest trading date (e.g. if today is Sat, returns Fri date)
	getLatestTradingDate: () => {
		var latestTradingDate = moment()
		while(latestTradingDate.format('d') == 0 || latestTradingDate.format('d') == 6) {
			latestTradingDate = latestTradingDate.subtract(1, 'day')
		}
		return latestTradingDate.startOf('day')
	},
	formatDate: (momentDate) => {
		momentDate.format('YYYYMMDD')
	},
	csvHeaders: csvHeaders,
	indexes: ['PSEI', 'MINI', 'PROP', 'SERV', 'INDU', 'FINA', 'HOLD', 'ALLS'],

	// string manipulation
	replaceUnderscoreWithSpace(string) {
		return string.replace(/_/g, ' ');
	},
}