<template lang="pug">
  section
    header.flex.border-bottom
      .col-4.p2.border-right
        small.lh2.block Price
        .font-exp.mt1.truncate(v-if="isRFT") {{ priceInCollateral.toFormat(4) }} {{collateral}} per {{currentToken}}
        .font-exp.mt1.truncate(v-else) ${{ priceInUSD.toFormat(2) }} per {{currentToken}}
      .col-4.p2.border-right
        small.lh2.block Total Supply
        .font-exp.mt1.truncate {{ totalSupply.toFormat(0) }} {{currentTokenPlural}}
      .col-4.p2
        small.lh2.block Market Cap
        .font-exp.mt1.truncate(v-if="isRFT") {{ marketCapInCollateral.toFormat(0) }} {{collateral}}
        .font-exp.mt1.truncate(v-else) ${{ marketCapInUSD.toFormat(2) }}
    section
      .relative
        span.block.absolute.left-0.top-0.p2.h6 Price Graph in {{collateral}} per {{currentToken}}
        chart.border-bottom(:market="market", :orders="orders.slice(0,6)")
      view-nav(:items="[{lbl: 'Buy', value:'buy'}, {lbl: 'Sell', value:'sell'}]", @change="view = $event")
      section.pb4(v-if="view === 'buy'")
        form(@submit.prevent="buyTokens")
          .p2
            p.h7.mb1 I want to spend
            .relative
              input.input.border.font-exp(v-model="buy", placeholder="ETH", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed {{collateral}}
          .p2
            p.h7.mb1 I will receive
            .relative
              input.input.border.font-exp(v-model="clubReceive", placeholder="♣ Tokens", disabled="true")
              span.absolute.top-0.right-0.p2.claimed {{currencies}}
          .h-bttm-bar.bg-green.white.fixed-center-max-width.bottom-0.col-12
            button.h-bttm-bar.h3.block.m-auto.font-exp(v-if="!working") Buy
            .h-bttm-bar.block.m-auto.flex.justify-center.items-center(v-else)
              wavey-menu(:is-white="true")

      section.pb4(v-else)
        form(@submit.prevent="sellTokens")
          .p2
            p.h7.mb1 I want to sell
            .relative
              input.input.border.font-exp(v-model="sell", placeholder="♣ Tokens", type="number", min="0", step="any")
              span.absolute.top-0.right-0.p2.claimed {{currencies}}
          .p2
            p.h7.mb1 I will receive
            .relative
              input.input.border.font-exp(v-model="ethReceive", placeholder="ETH", disabled="true")
              span.absolute.top-0.right-0.p2.claimed {{collateral}}
          .h-bttm-bar.bg-green.white.fixed-center-max-width.bottom-0.col-12
            button.h-bttm-bar.h3.block.m-auto.font-exp(v-if="!working") Sell
            .h-bttm-bar.block.m-auto.flex.justify-center.items-center(v-else)
              wavey-menu(:is-white="true")
</template>

<script>
import utils from 'web3-utils'
import BigNumber from 'bignumber.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import ViewNav from '@/components/ViewNav'
import Chart from '@/components/Chart'
import { prettyBigNumber } from '@/utils'
import WaveyMenu from '@/components/Icons/WaveyMenu'

export default {
  name: 'Trade',
  data () {
    return {
      view: 'buy',
      buy: '1',
      clubReceive: '1',
      sell: '10',
      ethReceive: '1',
      working: false
    }
  },
  props: {
    market: {
      type: String,
      default: 'ClubToken'
    }
  },
  watch: {
    'orders.length' () {
      this.checkOutMarket()
    },
    buy (amount) {
      this.checkPrice(amount)
    },
    sell (amount) {
      this.checkSell(amount)
    }
  },
  computed: {
    isRFT () {
      return this.market !== 'ClubToken'
    },
    marketContract () {
      return this.isRFT ? 'CurationMarket' : 'ClubTokenController'
    },
    collateral () {
      return this.isRFT ? '♣︎' : 'Eth'
    },
    currentToken () {
      return this.isRFT ? 'Share' : '♣︎'
    },
    currentTokenPlural () {
      return this.currentToken === 'Share' ? 'Shares' : '♣︎'
    },
    currencies () {
      return this.currentToken === 'Share' ? 'Shares' : 'Club Tokens (♣︎)'
    },
    priceInCollateralString () {
      return this.priceInCollateral.toString()
    },
    priceInCollateral () {
      if (!this.orders.length) return new BigNumber(0)
      let recent = this.orders[0]
      return new BigNumber(recent.value).div(new BigNumber(recent.tokens))
    },
    priceInEthString () {
      return this.priceInEth.toString()
    },
    priceInEth () {
      if (this.marketContract === 'CurationMarket') {
        return this.priceInCollateral.div(new BigNumber(this.clubTokenPrice))
      } else {
        return this.priceInCollateral
      }
    },
    priceInUSDString () {
      return this.priceInUSD.toString()
    },
    priceInUSD () {
      return this.priceInEth.times(new BigNumber(this.ethPrice))
    },
    totalSupplyWei () {
      if (!this.orders.length) return new BigNumber(0)
      let recent = this.orders[0]
      return new BigNumber(recent.tokenSupply)
    },
    totalSupply () {
      return new BigNumber(
        utils.fromWei(this.totalSupplyWei.round().toString(10))
      )
    },
    marketCapInCollateralWei () {
      return this.priceInCollateral.times(this.totalSupplyWei)
    },
    marketCapInCollateral () {
      return new BigNumber(
        utils.fromWei(this.marketCapInCollateralWei.round().toString(10))
      )
    },
    marketCapInWei () {
      if (this.marketContract === 'CurationMarket') {
        return this.marketCapInCollateral.times(
          new BigNumber(utils.fromWei(this.clubTokenPrice))
        )
      } else {
        return this.marketCapInCollateralWei
      }
    },
    marketCapInEth () {
      return new BigNumber(
        utils.fromWei(this.marketCapInWei.round().toString(10))
      )
    },
    marketCapInUSD () {
      return this.marketCapInEth.times(new BigNumber(this.ethPrice))
    },
    ...mapState(['ethPrice', 'clubTokenPrice', 'orders']),
    ...mapGetters(['userBalance', 'prettyUserBalance'])
  },
  methods: {
    checkPrice (amount = '1') {
      this.getBuy({ market: this.market, amount }).then(tokens => {
        this.clubReceive = prettyBigNumber(tokens, 0)
      })
    },
    checkSell (amount = '10') {
      this.getSell({ market: this.market, amount }).then(eths => {
        this.ethReceive = prettyBigNumber(eths, 6)
      })
    },
    buyTokens () {
      this.working = true
      this.invest({ market: this.market, amount: this.buy })
        .then(res => {
          this.working = false
          this.handleSuccess(
            `Success! You bought ${this.clubReceive} ${this.currentToken}`
          )
          console.log(res)
        })
        .catch(err => {
          this.working = false
          this.handleError(err)
        })
    },
    sellTokens () {
      this.working = true
      this.divest({
        market: this.market,
        amount: this.sell,
        clover: this.board
      })
        .then(res => {
          this.working = false
          this.handleSuccess(
            `Success! You sold ${this.sell} ${this.currentToken}`
          )
          console.log(res)
        })
        .catch(err => {
          this.working = false
          this.handleError(err)
        })
    },
    handleError ({ message }) {
      this.selfDestructMsg({
        msg: message.replace('Error: ', ''),
        type: 'error'
      })
    },
    handleSuccess (msg) {
      this.addMessage({
        msg,
        type: 'success'
      })
    },
    checkOutMarket () {
      console.log('check out market')
      this.getClubTokenPrice()
      this.getOrders(this.market || 'ClubToken')
      this.checkPrice()
      this.checkSell()
    },
    ...mapActions([
      'getClubTokenPrice',
      'clearOrders',
      'getOrders',
      'getBuy',
      'getSell',
      'invest',
      'divest',
      'addMessage',
      'selfDestructMsg'
    ])
  },
  mounted () {
    this.checkOutMarket()
  },
  destroyed () {
    this.clearOrders()
  },
  components: { ViewNav, Chart, WaveyMenu }
}
</script>
