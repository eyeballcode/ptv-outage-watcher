import { default as checkPTVMetro } from './lib/check-ptv-metro.mjs'
import { default as checkPTVBus } from './lib/check-ptv-bus.mjs'

import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from './config.json' assert { type: 'json' }

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

let ptvMetro = await checkPTVMetro(ptvAPI)
if (ptvMetro.status === 'Healthy') console.log('PTV Metro: Healthy')
else {
  console.log(`PTV Metro: Unhealthy (${ptvMetro.code})`)
  if ('trackingUnavailable' in ptvMetro) console.log(`PTV Metro: Extended Tracking: ${ptvMetro.trackingUnavailable ? 'Unavailable' : 'Available'}`)
}

let ptvBus = await checkPTVMetro(ptvAPI)
if (ptvBus.status === 'Healthy') console.log('PTV Bus: Healthy')
else {
  console.log(`PTV Bus: Unhealthy (${ptvBus.code})`)
  if ('trackingUnavailable' in ptvBus) console.log(`PTV Bus: Extended Tracking: ${ptvMetro.trackingUnavailable ? 'Unavailable' : 'Available'}`)
}