const events = require('events');
const httpHerdsmanConverters = require('@instathings/http-herdsman-converters');

const logger = require('./util/logger');

class Http extends events.EventEmitter {
  constructor(mqtt, device) {
    super();
    this.mqtt = mqtt;
    this.id = device.id;
    this.model = device.model;
    this.ipAddress = device.ipAddress;
    this.descriptor = httpHerdsmanConverters.findByHttpModel(this.model);
  }

  start() {
    const promise = new Promise((resolve, reject) => {
      this.descriptor.pair(this.ipAddress, (err, body) => {
        if (err) {
          logger.error(err);
          return reject(err);
        }
        resolve();
      });
    });
    return promise;
  }

  remove() {
    console.log('removed device', this.id);
  }
}

module.exports = Http;
