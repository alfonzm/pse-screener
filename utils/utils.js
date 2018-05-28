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
		return momentDate.format('YYYYMMDD')
	},
	csvHeaders: csvHeaders,
	indexes: ['PSEI', 'MINI', 'PROP', 'SERV', 'INDU', 'FINA', 'HOLD', 'ALLS'],

	// string manipulation
	replaceUnderscoreWithSpace(string) {
		return string.replace(/_/g, ' ');
	},
	decimalify(amount) {
		// e.g. converts 1000.12999 => 1000.13
		return Math.round(amount * 100) / 100
	},
	commafy(number) {
		// e.g. converts 123456 => 123,456
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	},
	currencify(amount) {
		// e.g. converts 10000.12999 => 10,000.13
		return this.commafy(this.decimalify(amount))
	}
}