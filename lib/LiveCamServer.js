const _ = require('lodash');
const debug = require('debug')('lodash:LiveCamServer');
const Config = require('./Config');
const GstLaunch = require('./GstLaunch');

/** launches a pipeline that serves the camera over TCP */
class LiveCamServer {
  constructor() {
    this._gstreamer = new GstLaunch();
    debug('LiveCamServer config: %O', Config.camera);
    const elements = [String(Config.camera.element), 'queue max-size-buffers=100 leaky=upstream', 'videoconvert'];
    if (Config.camera.width * Config.camera.height != 0) {
      elements.push('videoscale');
      elements.push(`video/x-raw,width=${Math.round(Config.camera.width)},height=${Math.round(Config.camera.height)}`);
      elements.push('videoconvert');
    }
    if (Config.camera.framerate > 0) {
      elements.push('videorate');
      elements.push(`video/x-raw,framerate=${Math.round(Config.camera.framerate)}/1`);
      elements.push('videoconvert');
    }
    if (Config.camera.grayscale) {
      elements.push('videobalance saturation=0.0');
      elements.push('videoconvert');
    }
    elements.push('queue max-size-buffers=100 leaky=upstream');
    elements.push(`jpegenc ${Math.floor(_.clamp(Config.camera.quality, 0, 100))}`);
    elements.push(`multipartmux boundary="${Config.server.boundary}"`);
    elements.push(`tcpserversink host="${Config.server.host}" port=${Config.server.port} sync=false`);

    const pipeline = elements.join(' ! ');
    debug('LiveCamServer pipeline: %s', pipeline);
    this._pipeline = pipeline;
  }

  get pipeline() {
    return this._pipeline;
  }

  start() {
    return this._gstreamer.launchPipeline(this.pipeline);
  }
}

module.exports = LiveCamServer;