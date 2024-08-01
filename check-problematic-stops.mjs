import { default as checkPTVBus } from './lib/check-ptv-bus.mjs'

import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from './config.json' assert { type: 'json' }

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

let problematicBusStops = {
  "Sunbury": "18759",
  "Ballarat": "49016",
  "Seymour": "42068"
}

let overallStatus = ''

for (let stopName of Object.keys(problematicBusStops)) {
  let status = await checkPTVBus(ptvAPI, problematicBusStops[stopName])

  if (status.status == 'Healthy') overallStatus += `${stopName}: Healthy\n`
  else overallStatus += `${stopName}: Unhealthy (${status.code})\n`
}

console.log(overallStatus)