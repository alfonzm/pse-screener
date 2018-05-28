import Utils from '../utils/utils'

import { Router } from 'express'
import path from 'path'

import fs from 'fs'
import cheerio from 'cheerio'
import moment from 'moment'
import puppeteer from 'puppeteer'

const Json2csvParser = require('json2csv').Parser
const router = Router()

const todayDate = Utils.formatDate(Utils.getLatestTradingDate())

require('dotenv').config()

const CREDS = {
	email: process.env.INVESTAGRAMS_EMAIL,
	pass: process.env.INVESTAGRAMS_PASSWORD,
}

const HOME_URL = 'https://investagrams.com'
const TERMINAL_URL = 'https://www.investagrams.com/Account/Tools/Application/Terminal'
const USERNAME_SELECTOR = '#WelcomePageMainContent_ctl00_Username'
const PASSWORD_SELECTOR = '#WelcomePageMainContent_ctl00_Password'
const BUTTON_SELECTOR = '#LoginButton'

async function crawlInvestagramTerminal() {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	page.setDefaultNavigationTimeout(0)

	console.log('Crawling stock data from Investagrams.')
	await page.goto(TERMINAL_URL)

	// Login
	console.log('Logging in.')
	await page.click(USERNAME_SELECTOR)
	await page.keyboard.type(CREDS.email)
	await page.click(PASSWORD_SELECTOR)
	await page.keyboard.type(CREDS.pass)
	await page.click(BUTTON_SELECTOR)

	console.log('Login done. Going to Terminal page.')
	await page.waitForNavigation()

	// Go to terminal
	const html = await page.$eval('body', el => el.outerHTML)
	convertHtmlToCsv(html, browser)

	// fs.writeFile('csv/investa.html', html, function(err) {
	// 	if(err) {
	// 		console.error(err)
	// 	} else {
	// 		console.log('HTML saved: investa.html')
	// 		convertHtmlToCsv()
	// 	}

		// browser.close()
	// })
}

function convertHtmlToCsv(html, browser) {
	console.log('Converting HTML to CSV.')

	const $ = cheerio.load(html)
	const headers = []
	const stocks = []

	const table = $('table.dataTable')

	table.find('thead tr').first().find('td').each(function(i, col) {
		headers.push($(this).text())
	})

	const stockRows = table.find('tbody').first().find('tr')

	stockRows.each(function(i, stockRow) {
		let stock = {}
		const rowEl = $(this)

		rowEl.find('td').each(function(i, col) {
			const colEl = $(this)
			const value = colEl.text()

			if(headers[i].indexOf('RSI') !== -1 && isNumeric(value)) {
				stock[headers[i] + '_VALUE'] = value
			} else{ 
				stock[headers[i]] = value
			}
		})

		stocks.push(stock)
	})

	console.log(`${stocks.length} stocks data saved. Saving to ${todayDate}.csv.`)

	try {
		const parser = new Json2csvParser(headers)
		const csv = parser.parse(stocks)
		fs.writeFile(`csv/${todayDate}.csv`, csv, function(err) {
			if(err) {
				console.error(err)
			} else {
				console.log(`Saved to ${todayDate}.csv!`)
			}
			browser.close()
		})
	} catch (err) {
		console.error('Error writing csv file ', err)
		browser.close()
	}


}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

router.get('/', (req, res) => {
	crawlInvestagramTerminal()
	res.send('done')
})

export default router