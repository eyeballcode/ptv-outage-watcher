import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from '../config.json' assert { type: 'json' }

function getCISTrips(departures) {
  return departures.filter(departure => {
    return departure.runData.tdn !== null
  })
}

function hasOpTimetable(departures) {
  return departures.length > 0
}

function hasLiveDepartures(departures) {
  return departures.some(departure => {
    return departure.estimatedDeparture !== null
  })
}

function departuresHasTracking(departures) {
  return departures.some(departure => {
    return departure.runData.position !== null
  })
}

export default async function check() {
  let stopGTFSID = 19902
  let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

  let departures = await ptvAPI.metro.getDepartures(stopGTFSID, {
    gtfs: true,
    maxResults: 2,
    expand: ['VehiclePosition', 'VehicleDescriptor']
  })

  let cisTrips = getCISTrips(departures)

  if (!hasOpTimetable(cisTrips)) return {
    status: 'Unhealthy',
    code: 'NO_OP_TIMETABLE'
  }

  let hasTracking = departuresHasTracking(cisTrips)

  if (!hasLiveDepartures(cisTrips)) return {
    status: 'Unhealthy',
    code: 'NO_LIVE_ETA',
    trackingAvailable: hasTracking
  }

  if (!hasTracking) return {
    status: 'Unhealthy',
    code: 'NO_TRACKING'
  }

  return {
    status: 'Healthy',
    code: 'OK'
  }
}