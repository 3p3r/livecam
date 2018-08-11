const debug = require('debug')('livecam:Config');
const Config = require('rc')('livecam', {
  gstreamer: ''
});

debug('Config object is %O', Config);
module.exports = Config;