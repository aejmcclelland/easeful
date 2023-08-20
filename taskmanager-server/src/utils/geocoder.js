const NodeGeocoder = require('node-geocoder');

const options = {
	provider: process.env.GEOCODE_PROVIDER,
	httpAdapter: 'https',
	apiKey: process.env.MAPBOX_TOKEN,
	formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
