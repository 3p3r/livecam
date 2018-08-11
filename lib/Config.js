const debug = require('debug')('livecam:Config');
const Config = require('rc')('livecam', {
  gstreamer: '',
  camera: {
    element: 'autovideosrc',
    grayscale: false,
    framerate: 30,
    quality: 100,
    height: 640,
    width: 480,
  },
  server: {
    boundary: '--videoboundary',
    timeout: 5000,
    tcp: {
      host: '127.0.0.1',
      port: 9999
    }
  },
  broadcast: {
    host: '0.0.0.0',
    port: 9998
  }
});

debug('Config object is %O', Config);
module.exports = Config;