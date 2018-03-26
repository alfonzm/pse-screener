import { Router } from 'express'
import csv from 'csvtojson'
import moment from 'moment'

import Daily from '../models/Daily'

const router = Router()

/* GET stocks today or on given date param */
router.get('/stocks', function (req, res, next) {
  var stocks = []
  csv()
  .fromFile('csv/20180323.csv')
  .on('json', (jsonObj) => {
    stocks.push(jsonObj)
  })
  .on('done', (error) => {
    if(error) { res.json(error) }
    else { res.json(stocks) }
  })
})

export default router