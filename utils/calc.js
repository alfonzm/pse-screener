import moment from 'moment'
import Utils from './utils'

export default {
	// Commission thingies
	getBuyFees(price, quantity) {
		if(price <= 0) {
			return 0
		}

		const gross = price * quantity

		const commission = (0.0025*gross) > 20 ? (0.0025 * gross) : 20
		const vat = commission * 0.12
		const pseFee = 0.00005 * gross
		const sccpFee = 0.0001 * gross

		return commission + vat + pseFee + sccpFee
	},
	getSellFees(sellPrice, quantity) {
		var gross = sellPrice * quantity
		var fees = this.getBuyFees(sellPrice, quantity)

		var salesTax = gross * 0.006

		return fees + salesTax
	},

	// Trading calculations
	getBuyCost(price, quantity) {
		return (price * quantity) + this.getBuyFees(price, quantity)
	},
	getSellCost(price, quantity) {
		return (price * quantity) - this.getSellFees(price, quantity)
	},
	getProfit(entry, exit, quantity) {
		if(!entry || !exit || !quantity) {
			return 0
		}

		return this.getSellCost(exit, quantity) - this.getBuyCost(entry, quantity)
	},
	getRiskRewardRatio(entry, stopLoss, targetPrice, precision = 100) {
		if(!entry || !stopLoss || !targetPrice) {
			return 0
		}

		if(entry == stopLoss) {
			return 0
		}

		return Math.round((targetPrice - entry) / (entry - stopLoss) * precision) / precision
	},
	getPercentChange(sellCost, buyCost) {
		return Math.round((sellCost / buyCost) * 100 * 100)/100 
	},
}