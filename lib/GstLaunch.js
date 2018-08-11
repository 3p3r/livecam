const _ = require('lodash');
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const parse = require('shell-quote').parse;
const debug = require('debug')('livecam:GstLaunch');
const assert = require('assert');
const semver = require('semver');
const Config = require('./Config');
const loggers = {
  stdout: require('debug')('livecam:GstLaunch"stdout'),
  stderr: require('debug')('livecam:GstLaunch"stderr'),
}

function logSpawnedPipeline(process, type, what) {
  assert.ok(Object.keys(loggers).includes(type));
  loggers[type](`[${process.pid}] [${type}]: ${what}`);
}

/** Wraps the gst-launch-1.0 executable and provides convenience methods */
class GstLaunch {
  constructor() {
    debug('looking for gst-launch-1.0 binary');
    // we look for gstreamer in this order:
    // 1. check if user passed anything with rc (all-platforms)
    // 2. use 'which' to look for gstreamer automatically (Mac and Linux)
    // 3. use process.env.GSTREAMER_1_0_ROOT_X86_64 (windows 64 and 32 bit)
    // 4. use process.env.GSTREAMER_1_0_ROOT_X86_64 (windows 32 bit)
    const bin = String(Config.gstreamer) ||
      cp.spawnSync('which gst-launch-1.0').toString().trim() ||
      path.resolve(process.env.GSTREAMER_1_0_ROOT_X86_64, 'bin/gst-launch-1.0.exe') ||
      path.resolve(process.env.GSTREAMER_1_0_ROOT_X86, 'bin/gst-launch-1.0.exe');
    // to do: add windows logic here
    assert.ok(fs.existsSync(bin), 'GStreamer not found');
    debug(`gst-launch-1.0 binary found at ${bin}`);
    this._path = bin;

    debug('trying to extract GStreamer version');
    const versionOut = cp.spawnSync(`${bin} --version`).toString().trim().toLowerCase();
    debug('--version response: %s', versionOut);
    assert.ok(versionOut.includes('gstreamer'), 'invalid GStreamer binary');
    const version = _.get(versionOut.match(/GStreamer\s+.+/g), '[0]', '').replace(/GStreamer\s+/, '');
    debug('--version extract: %s', version);
    assert.ok(semver.valid(version), 'unable to extract GStreamer version');
    this._version = version;
  }

  get path() {
    return this._path;
  }

  get version() {
    return this._version;
  }

  /**
   * Launches a GStreamer pipeline as a child process and returns it
   * @param {string} pipelineCommand GStreamer pipeline (without the gst-launch-1.0 part)
   * @example launchPipeline('videotestsrc ! fakesink')
   */
  launchPipeline(pipelineCommand) {
    assert.ok(typeof pipelineCommand == typeof '', 'you must pass a string as your pipeline');
    assert.ok(!pipelineCommand.includes('gst-launch'), 'omit the gst-launch part from your pipeline');
    debug('spawning pipeline: %s', pipelineCommand);
    const args = parse(pipelineCommand);
    debug('parsed pipeline:', args);
    const process = cp.spawn(this.path, args);
    debug(`pipeline process launched: ${process.pid}`);
    process.stdout.on('data', logSpawnedPipeline.bind(null, process, 'stdout'));
    process.stderr.on('data', logSpawnedPipeline.bind(null, process, 'stderr'));
    return process;
  }
}

module.exports = GstLaunch;