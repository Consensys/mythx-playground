var assert = require('chai').assert

const poller = require('../../lib/analysisPoller')
describe('geometric poller', () => {
  it('should compute gemometric delays', async () => {
    for (const timeout of [
      1000 * 60 * 2, // two minutes
      1000 * 60 * 60 // one hour
    ]) {
      const pollC = poller.inverseFn(timeout)
      // console.log(pollC)
      let result = []
      let total = 0
      for (let i = 1; i <= poller.maxPolls - 1; i++) {
        const next = (pollC * i) ** 2
        total += next
        result.push(next)
      }

      // console.log(total)
      let lastDelay = result[0]
      for (let i = 1; i < poller.maxPolls - 1; i++) {
        // Could get fancier than <
        assert.isBelow(lastDelay, result[i])
        lastDelay = result[i]
      }
      assert.approximately(total, timeout, 0.01)
      // console.log(timeout)
      // console.log(result)
    }
  })
})
