import { default as checkPTVMetro } from './lib/check-ptv-metro.mjs'
import { default as checkPTVBus } from './lib/check-ptv-bus.mjs'

import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from './config.json' with { type: 'json' }

import sendMessage from './discord-api.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

let metroCheckStops = [
  19902, // RWD
  19915, // CLA
  20025, // FSY
  19979, // JLI
  19854, // FSS
  19973, // NME
]

let busCheckStops = [
  47252, // RWD
  19810, // Monash
  47764, // FSY
  47160, // Northland
  21477, // BMS
]

let statusReport = ''

let ptvMetro
for (let stop of metroCheckStops) {
  ptvMetro = await checkPTVMetro(ptvAPI, stop)
  if (ptvMetro.status === 'Healthy') break
}

if (ptvMetro.status === 'Healthy') statusReport += 'PTV Metro: Healthy\n'
else {
  statusReport += `PTV Metro: Unhealthy (${ptvMetro.code})\n`
  if ('trackingUnavailable' in ptvMetro) statusReport += `PTV Metro: Extended Tracking: ${ptvMetro.trackingUnavailable ? 'Unavailable' : 'Available'}\n`
}

let ptvBus
for (let stop of busCheckStops) {
  ptvBus = await checkPTVBus(ptvAPI, stop)
  if (ptvBus.status === 'Healthy') break
}

if (ptvBus.status === 'Healthy') statusReport += 'PTV Bus: Healthy\n'
else {
  statusReport += `PTV Bus: Unhealthy (${ptvBus.code})\n`
  if ('trackingUnavailable' in ptvBus) statusReport += `PTV Bus: Extended Tracking: ${ptvMetro.trackingUnavailable ? 'Unavailable' : 'Available'}\n`
}

if (process.argv[2] == '-c') console.log(statusReport)
else await sendMessage(statusReport)