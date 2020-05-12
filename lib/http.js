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

  get(actionId, queryParams) {
    const promise = new Promise((resolve, reject) => {
      this.descriptor.get(actionId, queryParams, this.ipAddress, (err, body) => {
        if (err) {
          logger.error(err);
          return reject(err);
        }
        return resolve(body);
      });
    });
    return promise;
  }

  set(actionId, options) {
    const promise = new Promise((resolve, reject) => {
      this.descriptor.set(actionId, this.ipAddress, options, (err, body) => {
        if (err) {
          logger.error(err);
          return reject(err);
        }
        return resolve(body);
      });
    });
    return promise;
  }

  remove() {
    console.log('removed device', this.id);
  }
}

module.exports = Http;
