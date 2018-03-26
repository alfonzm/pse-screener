import moment from 'moment'
import csvHeaders from './CsvHeaders'

export default {
	getLatestTradingDate: () => {
		var latestTradingDate = moment()
		while(latestTradingDate.format('d') == 0 || latestTradingDate.format('d') == 6) {
			latestTradingDate = latestTradingDate.subtract(1, 'day')
		}
		return latestTradingDate.startOf('day')
	},
	csvHeaders: csvHeaders,
	indexes: ['PSEI', 'MINI', 'PROP', 'SERV', 'INDU', 'FINA', 'HOLD', 'ALLS']
}