import { Router } from 'express'
import _ from 'lodash'
import fs from 'fs'

import stocks from './stocks'
import dailies from './dailies'

const router = Router()

// Add Stocks Routes
router.use(stocks)
router.use(dailies)

router.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html')
})

// router.get('/stock/:symbol', (req, res) => {
// 	let symbol = req.params.symbol
// 	let stockData = db.get('stock.' + symbol).value()

// 	if(!stockData) {
// 		retrieveAndSaveStockData(symbol, (data) => {
// 			res.send(data)
// 		})
// 	} else {
// 		let hasRetrievedLatestStockData = moment(stockData.t[stockData.t.length-1]).isBefore(getLatestTradingDate())
// 		if(hasRetrievedLatestStockData) {
// 			console.log("Data cached for " + symbol)
// 			res.send(stockData)
// 		} else {
// 			retrieveAndSaveStockData(symbol, (data) => {
// 				res.send(data)
// 			})
// 		}
// 	}
// })

function getLatestTradingDate() {
	var latestTradingDate = moment()
	while(latestTradingDate.format('d') == 0 || latestTradingDate.format('d') == 6) {
		latestTradingDate = latestTradingDate.subtract(1, 'day')
	}
	return latestTradingDate
}

function saveStockData(symbol, data) {
	db.set('stock.' + symbol, data).write()
}

function retrieveAndSaveStockData(symbol, callback) {
	console.log("Retrieving stock data for " + symbol)
	var startDate = moment().subtract(30, 'day').unix()
	var today = moment().unix()

	axios.get('http://api.pse.tools/api/chart/history?symbol='+symbol+'&resolution=D&from='+startDate+'&to='+today)
	.then(function (response) {
		saveStockData(symbol, response.data)
		callback(response.data)
	})
	.catch(function (error) {
		console.log(error)
	});
}

// returns stock data today by default
// router.get('/stocks/:date?', (req, res) => {
// 	var currentDate = req.params.date || moment().format('YYYYMMD')
// 	var stockDataToday = db.get('stocks.' + currentDate)

// 	if(stockDataToday.get('stock').size().value() <= 0) {
// 		console.log("Querying phisix for " + currentDate)
// 		axios.get('http://phisix-api.appspot.com/stocks.json')
// 		.then(function (response) {
// 			var date = moment(response.data.as_of).format('YYYYMMD')
// 			db.set('stocks.' + date, response.data).write()
// 			res.send(response.data)
// 		})
// 		.catch(function (error) {
// 			res.send(error)
// 		})
// 	} else {
// 		console.log("Data cached for " + currentDate)
// 		res.send(stockDataToday)
// 	}
// })

export default router
