const events = require('events');
const httpRequest = require('./util/request');
const Telnet = require('telnet-client')
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

  async pair() {
    const connection = new Telnet();

    const params = {
      host: this.hostname,
      port: this.port,
      negotiationMandatory: false,
      timeout: 1500,
    };

    try {
      await connection.connect(params);
    } catch (error) {
      return false;
    }
    try {
      await connection.end();
    } catch (error) {
      return true;
    }
    return true;
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
