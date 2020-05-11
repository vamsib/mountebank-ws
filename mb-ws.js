#!/usr/bin/env node

'use strict';

const fetch = require("node-fetch");
const WebSocket = require("ws");

const customResponse = require('./ws_responses.js');

if (require.main === module) {
  if (process.argv.length !== 3) {
    console.error(`error Expected 1 argument, got ${process.argv.length - 2}: ${process.argv.slice(2).join(' ')}. Make sure to execute this as createCommand in a mountebank protocol.`);
    process.exit(1);
  }

  let config = JSON.parse(process.argv[2]);
  config.callbackURL = config.callbackURLTemplate.replace(':port', config.port);

  const ws = new WebSocket.Server({
    port: config.port
  });

  ws.on('connection', function open(ws) {
    let interval = {};
    ws.on('message', function incoming(data) {
      fetch(config.callbackURL, {
        method: 'post',
        body: JSON.stringify({request: {message: data}}),
        headers: {'Content-Type': 'application/json'},
      }).then(res => res.json()).then(json => {
        const isCustomResponse = undefined !== typeof json.response.__MB_CUSTOM_RESPONSE;
        const responseConfig  = json.response.__MB_CUSTOM_RESPONSE || {};
        if (responseConfig.command && responseConfig.command === 'start_stream'
            && responseConfig.interval
            && responseConfig.source) {
          interval[responseConfig.id] = setInterval(() => {
            ws.send(customResponse[responseConfig.source](data));
          }, responseConfig.interval);
          return;
        }
        if (responseConfig.command && responseConfig.command === 'stop_stream') {
          clearInterval(interval[responseConfig.id]);
          return;
        }
        ws.send(json.response);
      });
    });

    ws.on('close', function close() {
      for (const runningInterval in interval) {
        if (interval.hasOwnProperty(runningInterval)) {
          clearInterval(interval[runningInterval]);
        }
      }
    });

    console.log("Web socket plugin started");
  });
}

