/* GET latest daily stock data */
router.get('/dailies/latest', function (req, res, next) {
	const d = Daily.today((daily) => {
		if(!daily) {
			let stocks = []
			// If no daily on db, get from CSV and save to mongodb
			csv().fromFile(`csv/${Utils.getLatestTradingDate().format('YYYYMMDD')}.csv`)
			.on('json', (stockRow) => {
				stocks.push(stockRow)
			})
			.on('done', (error) => {
				if(error) {
					res.json(error)
				}

				var daily = new Daily({ data: stocks })
				daily.save()
				res.json(daily)
			})
		} else {
			res.json(daily)
		}
	})
})