import _ from 'lodash'
import mongoose from 'mongoose'
import moment from 'moment'
import Utils from '../../utils/utils'

const Schema = mongoose.Schema

const integerSettings = {
	type: Number,
	get: v => Math.round(v.replace(/,/g, '')),
	set: v => Math.round(v.replace(/,/g, ''))
}

const floatSettings = {
	type: Number,
	get: v => parseFloat(v.replace(/,/g, '')),
	set: v => parseFloat(v.replace(/,/g, ''))
}

const floatFields = ['last', 'change', 'open', 'low', 'high', 'close', 'value', 'net_foreign', '52_week_high', '52_week_low', 'support_1', 'support_2', 'resistance_1', 'resistance_2', 'ma_20', 'ma_50', 'ma_100', 'ma_200', 'ema_20', 'ema_50', 'ema_100', 'ema_200', 'rsi(14)', 'macd(12,26,9)', 'cci(20)', 'sts(14,3,3)', '%r(14)', 'valuesma(10)', 'valuesma(15)', 'valuesma(20)', 'nfb(5)', 'nfb(15)', 'nfb(30)', 'nfb(60)', 'nfb(360)', 'eps', 'p/e', 'p/bv', 'roe', '%change', '%r(14)', 'ytd%', 'mtd%', 'wtd%', 'eps%', 'dps%']

const intFields = ['volume', 'volumesma(10)', 'volumesma(15)', 'volumesma(20)']
const dataSchema = {}

_.forEach(floatFields, (floatField) => {
	dataSchema[floatField] = floatSettings
})

_.forEach(intFields, (intField) => {
	dataSchema[intField] = integerSettings
})

let dailySchema = new Schema({
	date: { type: Date, default: Date.now },
	data: [dataSchema]
}, { strict:false })

function getByDate(daily, momentDate, callback) {
	const tomorrow = moment(momentDate).add(1, 'days')

	daily.find({
		date: {
			$gte: momentDate.toDate(),
			$lt: tomorrow.toDate()
		}
	}).exec((err, dailies) => {
		if(dailies && dailies.length > 0){
			callback(dailies[0])
		} else {
			callback(null)
		}
	})
}

dailySchema.statics.getByDate = function(momentDate, callback) {
	getByDate(this, momentDate, callback)
}

dailySchema.statics.latest = function (callback) {
	getByDate(this, Utils.getLatestTradingDate(), callback)
}

var Daily = mongoose.model('Daily', dailySchema)

export default Daily