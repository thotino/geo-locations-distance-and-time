const axios = require('axios')
const expect = require('expect')
const { Given, When, Then, Before, BeforeAll } = require('cucumber')

const app = require('../../../index')
BeforeAll(function() {
    this.baseUrl = 'http://localhost:3000'
    // app.close()
})
Before(function () {
    this.request = {}
})
Given('a {string} location with latitude of {float} and longitude of {float}', function(locationType, locationLatitude, locationLongitude) {
    switch (locationType) {
        case 'starting':
            this.request.start = { lat: locationLatitude, lng: locationLongitude }
            break
        case 'ending':
            this.request.end = { lat: locationLatitude, lng: locationLongitude }
            break
        default:
            break;
    }
    console.log({ request: this.request })
})

When('we check the distance and time difference', async function() {

    const { data } = await axios({
        method: 'POST',
        url: `${this.baseUrl}/api/distance_and_time`,
        data: {
            start: this.request.start,
            end: this.request.end
        }
    })
    this.response = data
    console.log({ response: this.response })
    // const { distance, time_diff } = data
})

Then('we should get {int} kilometers', function(expectedAnswer) {
    const { distance: { value } } = this.response
    expect(value).toEqual(expectedAnswer)
})

Then('we should get {int} hours', function(expectedAnswer) {
    const { time_diff: { value } } = this.response
    expect(value).toEqual(expectedAnswer)
})