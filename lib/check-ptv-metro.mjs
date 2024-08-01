import { PTVAPI, PTVAPIInterface } from 'ptv-api'
import config from '../config.json' assert { type: 'json' }

function hasOpTimetable(departures) {
  return departures.some(departure => {
    return departure.runData.tdn !== null
  })
}

export default async function check() {
  let stopGTFSID = 19902
  let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

  let departures = await ptvAPI.metro.getDepartures(stopGTFSID, {
    gtfs: true,
    maxResults: 2
  })

  if (!hasOpTimetable(departures)) return {
    status: 'Unhealthy',
    code: 'NO_OP_TIMETABLE'
  }
}