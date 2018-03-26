import { Router } from 'express'
import csv from 'csvtojson'
import moment from 'moment'
import _ from 'lodash'

import Daily from '../models/Daily'
import Utils from '../../utils/utils'

const router = Router()

/* GET latest daily stock data */
router.get('/dailies/:date?', function (req, res, next) {
	const date = moment(req.params.date, 'YYYYMMDD').startOf('day') || Utils.getLatestTradingDate()
	const dateForFilename = date.format('YYYYMMDD')

	const returnResult = (daily) => {
		console.log(daily)
		let dailyObject = daily.toObject()
		dailyObject.data = _.reject(dailyObject.data, (d) => { return Utils.indexes.includes(d.stock) })
		res.json(dailyObject)
	}

	const d = Daily.getByDate(date, (daily) => {
		if(!daily) {
			let stocks = []
			// If no daily on db, get from CSV and save to mongodb
			csv({ noheader: false, headers: Utils.csvHeaders })
			.fromFile(`csv/${dateForFilename}.csv`)
			.on('json', (stockRow) => {
				stocks.push(stockRow)
			})
			.on('done', (error) => {
				if(error) {
					console.log("ERROR reading csv", error)
					res.json(error)
					return
				}

				var daily = new Daily({ data: stocks, date: date })
				daily.save()
				returnResult(daily)
			})
		} else {
			returnResult(daily)
		}
	})
})

export default router