import { default as checkPTVBus } from './lib/check-ptv-bus.mjs'

import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from './config.json' assert { type: 'json' }

import sendMessage from './discord-api.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

let problematicBusStops = {
  "Sunbury": "18759",
  "Ballarat": "49016",
  "Seymour": "42068"
}

let overallStatus = 'Problematic Bus Stops:\n'

for (let stopName of Object.keys(problematicBusStops)) {
  let status = await checkPTVBus(ptvAPI, problematicBusStops[stopName])

  // Having anything is already good enough
  // Also SEY almost never has data because the buses run so infrequently
  if (status.status === 'Unhealthy' && status.code === 'NO_LIVE_ETA') status.status = 'Healthy'

  if (status.status === 'Healthy') overallStatus += `${stopName}: Healthy\n`
  else overallStatus += `${stopName}: Unhealthy (${status.code})\n`
}

if (process.argv[2] == '-c') console.log(overallStatus)
else await sendMessage(overallStatus)