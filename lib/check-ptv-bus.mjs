import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from '../config.json' assert { type: 'json' }

function getSmartrakTrips(departures) {
  return departures.filter(departure => {
    return departure.runData.runRef.includes('-')
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
  let stopGTFSID = 51587
  let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

  let departures = await ptvAPI.bus.getDepartures(stopGTFSID, {
    gtfs: true,
    maxResults: 2,
    expand: ['VehiclePosition', 'VehicleDescriptor']
  })

  let smartrakTrips = getSmartrakTrips(departures)

  if (!hasOpTimetable(smartrakTrips)) return {
    status: 'Unhealthy',
    code: 'NO_OP_TIMETABLE'
  }

  let hasTracking = departuresHasTracking(smartrakTrips)

  if (!hasLiveDepartures(smartrakTrips)) return {
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