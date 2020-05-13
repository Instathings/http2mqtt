const events = require('events');
const httpHerdsmanConverters = require('@instathings/http-herdsman-converters');

const logger = require('./util/logger');

class Http extends events.EventEmitter {
  constructor(mqtt, device) {
    super();
    this.mqtt = mqtt;
    this.id = device.id;
    this.model = device.model;
    this.ipAddress = device.ip_address;
    this.descriptor = httpHerdsmanConverters.findByHttpModel(this.model);
  }

  start() {
    return this.descriptor.pair(this.ipAddress);
  }

  get(path, method, queryParams, body) {
    return this.descriptor.get(path, method, queryParams, body, this.ipAddress);
  }

  set(path, method, queryParams, body) {
    return this.descriptor.set(path, method, queryParams, body, this.ipAddress);
  }

  remove() {
    console.log('removed device', this.id);
  }
}

module.exports = Http;
