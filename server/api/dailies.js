import { Router } from 'express'
import csv from 'csvtojson'
import _ from 'lodash'

import Daily from '../models/Daily'
import Utils from '../../utils/utils'

const router = Router()

/* GET latest daily stock data */
router.get('/dailies/:date?', function (req, res, next) {
	const returnResult = (daily) => {
		let dailyObject = daily.toObject()
		dailyObject.data = _.reject(dailyObject.data, (d) => { return Utils.indexes.includes(d.stock) })
		res.json(dailyObject)
	}

	const d = Daily.latest((daily) => {
		if(!daily) {
			let stocks = []
			// If no daily on db, get from CSV and save to mongodb
			csv({ noheader: false, headers: Utils.csvHeaders })
			.fromFile(`csv/${Utils.getLatestTradingDate().format('YYYYMMDD')}.csv`)
			.on('json', (stockRow) => {
				stocks.push(stockRow)
			})
			.on('done', (error) => {
				if(error) {
					res.json(error)
				}

				var daily = new Daily({ data: stocks, date: Utils.getLatestTradingDate() })
				console.log("SAVE")
				daily.save()
				returnResult(daily)
			})
		} else {
			returnResult(daily)
		}
	})
})

export default router