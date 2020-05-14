const utils = require('../util/utils');
const logger = require('../util/logger');
const settings = require('../util/settings');
const Handler = require('../util/handler');
const Http = require('../http');

const handler = Handler.getInstance();

module.exports = async function start() {
  const info = await utils.getHttp2mqttVersion();
  logger.info(`Starting http2mqtt version ${info.version} (commit #${info.commitHash})`);

  try {
    await this.mqtt.connect();
    this.mqtt.subscribe(`${settings.get().mqtt.base_topic}/configure/set`);
    this.mqtt.subscribe(`${settings.get().mqtt.base_topic}/bridge/config/force_remove`);
    this.mqtt.subscribe(`${settings.get().mqtt.base_topic}/+/get`);
    this.mqtt.subscribe(`${settings.get().mqtt.base_topic}/+/set`);
    const { devices } = settings.get();


    const deviceIds = Object.keys(devices);
    // eslint-disable-next-line no-restricted-syntax
    for (const deviceId of deviceIds) {
      const device = devices[deviceId];
      device.id = deviceId;
      const instance = new Http(this.mqtt, device);
      const path = '';
      const method = 'GET';
      const queryParams = {};
      const body = {};
      // eslint-disable-next-line no-await-in-loop
      await instance.request(path, method, queryParams, body);
      handler.add(instance);
    }
  } catch (error) {
    logger.error('Failed to start..');
    logger.error('Exiting...');
    logger.error(error.stack);
    process.exit(1);
  }
  this.mqtt.on('message', this.onMQTTMessage.bind(this));
};
