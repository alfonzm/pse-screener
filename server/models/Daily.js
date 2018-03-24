import mongoose from 'mongoose'
import moment from 'moment'

const Schema = mongoose.Schema

let dailySchema = new Schema({
	date: { type: Date, default: Date.now },
	data: Schema.Types.Mixed
}, { strict:false })

dailySchema.statics.today = function (callback) {
	const today = moment().startOf('day')
	const tomorrow = moment(today).add(1, 'days')

	this.find({
		date: {
			$gte: today.toDate(),
			$lt: tomorrow.toDate()
		}
	}).exec((err, dailies) => {
		callback(dailies[0])
	})
}

var Daily = mongoose.model('Daily', dailySchema)

export default Daily