import { default as checkPTVMetro } from './lib/check-ptv-metro.mjs'

let ptvMetro = await checkPTVMetro()
if (ptvMetro.status === 'Healthy') console.log('PTV Metro: Healthy')
else {
  console.log(`PTV Metro: Unhealthy (${ptvMetro.code})`)
  if (trackingUnavailable in ptvMetro) console.log(`PTV Metro: Extended Tracking: ${ptvMetro.trackingUnavailable ? 'Unavailable' : 'Available'}`)
}