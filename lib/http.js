const events = require('events');
const httpRequest = require('./util/request');

// const logger = require('./util/logger');

class Http extends events.EventEmitter {
  constructor(mqtt, device) {
    super();
    this.mqtt = mqtt;
    this.id = device.id;
    this.model = device.model;
    this.protocol = device.protocol;
    this.hostname = device.hostname;
    this.port = device.port;
  }

  request(path, method, queryParams, body) {
    return httpRequest(
      this.protocol,
      this.hostname,
      this.port, path,
      method,
      queryParams,
      body,
    );
  }

  remove() {
    console.log('removed device', this.id);
  }
}

module.exports = Http;
