import { expect } from 'chai'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import nock from 'nock'
import { default as checkPTVMetro } from '../lib/check-ptv-metro.mjs'

import stubRegularDepartures from './mock/regular-metro-departures.json' assert { type: 'json' }
import stubNoOpTimetable from './mock/metro-no-op-timetable.json' assert { type: 'json' }

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// const gtfsr = (await fs.readFile(path.join(__dirname, 'mock', 'gtfsr-blank-response'))).toString()

describe('The PTV Metro Outage detector', () => {
  it('Should return a healthy response when the data is normal', async () => {
    nock('https://timetableapi.ptv.vic.gov.au').get(/\/v3\/departures\/route_type\/0\/.+/).reply(200, stubRegularDepartures)

    let status = await checkPTVMetro()
    expect(status.status).to.equal('Healthy')
  })

  it('Should return a healthy response when the data is normal', async () => {
    nock('https://timetableapi.ptv.vic.gov.au').get(/\/v3\/departures\/route_type\/0\/.+/).reply(200, stubNoOpTimetable)

    let status = await checkPTVMetro()
    expect(status.status).to.equal('Unhealthy')
    expect(status.code).to.equal('NO_OP_TIMETABLE')
  })
})