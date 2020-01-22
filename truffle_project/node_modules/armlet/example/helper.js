if (!process.env.MYTHX_ETH_ADDRESS) {
  console.log('Please set either environment variable MYTHX_ETH_ADDRESS ')
  process.exit(2)
}

if (!process.env.MYTHX_PASSWORD) {
  console.log('Please set environment variable MYTHX_PASSWORD')
  process.exit(3)
}
