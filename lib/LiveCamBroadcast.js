const io = require('socket.io');
const net = require('net');
const http = require('http');
const path = require('path');
const Dicer = require('dicer');
const debug = require('debug')('livecam:LiveCamBroadcast');
const express = require('express');

const Config = require('./Config');
const LiveCamServer = require('./LiveCamServer');

class LiveCamBroadcast {
  async start() {
    debug('about to start the broadcast server');
    const server = (new LiveCamServer()).start();
    const pipelineStarted = new Promise(resolve => {
      server.stdout.on('data', chunk => {
        if (chunk.toString().includes('Setting pipeline to PLAYING'))
          resolve();
      });
    });
    const timedOut = new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Pipeline did not want to start'));
      }, Config.server.timeout);
    });
    debug('waiting for gstreamer pipeline into playing');
    await Promise.all([pipelineStarted, timedOut]);

    debug('creating the socket wrapper');
    const socket = new net.Socket();
    await new Promise(resolve => {
      socket.connect(Config.server.port, Config.server.host, resolve);
    });

    debug('creating socket-io + dicer link');
    const app = express();
    app.use(express.static(path.resolve(__dirname, '../public')));
    const httpServer = http.createServer(app);
    const socketServer = io(httpServer);
    const dicer = new Dicer({
      boundary: Config.server.boundary
    });

    dicer.on('part', function (part) {
      let frameEncoded = '';
      part.setEncoding('base64');
      part.on('data', data => {
        frameEncoded += data;
      });
      part.on('end', () => {
        socketServer.sockets.emit('image', frameEncoded);
      });
    });

    socket.pipe(dicer);
    debug('about to bind http server to the specified port');
    httpServer.listen(Config.broadcast.port, Config.broadcast.host);

    this._socketServer = socket;
    this._httpServer = httpServer;
    this._server = server;
  }

  async stop() {
    debug('stopping the broadcast server');
    if (this._socketServer) {
      debug('stopping the socket server');
      this._socketServer.removeAllListeners();
      this._socketServer.destroy();
    }
    if (this._httpServer) {
      debug('stopping the http server');
      this._httpServer.removeAllListeners();
      this._httpServer.close();
    }
    if (this._server) {
      debug('stopping the GStreamer server');
      this._server.removeAllListeners();
      this._server.kill();
    }
  }
}

module.exports = LiveCamBroadcast;