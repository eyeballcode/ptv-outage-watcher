import { expect } from 'chai'
import nock from 'nock'
import { default as checkPTVBus } from '../lib/check-ptv-bus.mjs'
import { PTVAPI, PTVAPIInterface } from 'ptv-api'

import stubRegularDepartures from './mock/regular-bus-departures.json' assert { type: 'json' }
import stubNoOpTimetable from './mock/bus-no-op-timetable.json' assert { type: 'json' }

describe('The PTV Bus Outage detector', () => {
  let ptvAPI = new PTVAPI(new PTVAPIInterface('', ''))

  it('Should return a healthy response when the data is normal', async () => {
    nock('https://timetableapi.ptv.vic.gov.au').get(/\/v3\/departures\/route_type\/2\/.+/).reply(200, stubRegularDepartures)

    let status = await checkPTVBus(ptvAPI)
    expect(status.status).to.equal('Healthy')
  })

  it('Should return an unhealthy response when the op timetable wasn\'t loaded and is using the raw GTFS timetables', async () => {
    nock('https://timetableapi.ptv.vic.gov.au').get(/\/v3\/departures\/route_type\/2\/.+/).reply(200, stubNoOpTimetable)

    let status = await checkPTVBus(ptvAPI)
    expect(status.status).to.equal('Unhealthy')
    expect(status.code).to.equal('NO_OP_TIMETABLE')
  })

  it('Should return an unhealthy response when the op timetable is loaded but no ETA available', async () => {
    let timetable = JSON.parse(JSON.stringify(stubRegularDepartures)) // Lazy hack to clone data
    timetable.departures.forEach(departure => departure.estimated_departure_utc = null)

    nock('https://timetableapi.ptv.vic.gov.au').get(/\/v3\/departures\/route_type\/2\/.+/).reply(200, timetable)

    let status = await checkPTVBus(ptvAPI)
    expect(status.status).to.equal('Unhealthy')
    expect(status.code).to.equal('NO_LIVE_ETA')
    expect(status.trackingAvailable).to.be.true
  })

  it('Should return an unhealthy response when the op timetable is loaded with ETAs but no position/fleet data', async () => {
    let timetable = JSON.parse(JSON.stringify(stubRegularDepartures)) // Lazy hack to clone data
    timetable.departures.forEach(departure => {
      timetable.runs[departure.run_ref].vehicle_position = null
      timetable.runs[departure.run_ref].vehicle_descriptor = null
    })

    nock('https://timetableapi.ptv.vic.gov.au').get(/\/v3\/departures\/route_type\/2\/.+/).reply(200, timetable)

    let status = await checkPTVBus(ptvAPI)
    expect(status.status).to.equal('Unhealthy')
    expect(status.code).to.equal('NO_TRACKING')
  })
})