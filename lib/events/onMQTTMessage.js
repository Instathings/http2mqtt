const logger = require('../util/logger');
const settings = require('../util/settings');
const Handler = require('../util/handler');
const Http = require('../http');

const handler = Handler.getInstance();

const baseTopic = settings.get().mqtt.base_topic;

module.exports = async function onMQTTMessage(payload) {
  const { topic, message } = payload;
  logger.info(`Received MQTT message on '${topic}' with data '${message}'`);
  switch (topic) {
    case `${baseTopic}/configure/set`: {
      const parsedMessage = JSON.parse(message);
      logger.info(parsedMessage);
      const {
        id,
        model,
        protocol,
        hostname,
        port,
      } = parsedMessage;
      settings.addDevice(id, protocol, hostname, port, model);
      const instance = new Http(this.mqtt, parsedMessage);
      try {
        const path = '';
        const method = 'GET';
        const queryParams = {};
        const body = {};
        await instance.request(path, method, queryParams, body);
        handler.add(instance);
        const ackTopic = 'bridge/log';
        const ackMessage = {
          type: 'device_connected',
          message: {
            friendly_name: id,
          },
        };
        this.mqtt.publish(ackTopic, JSON.stringify(ackMessage));
      } catch (err) {
        console.log(err);
      }
      break;
    }

    case `${baseTopic}/bridge/config/force_remove`: {
      const id = message.toString();
      const instance = handler.get(id);
      if (instance) {
        try {
          await instance.remove();
        } catch (err) {
          console.log(err);
        }
      }
      settings.removeDevice(id);
      handler.remove(id);
      const ackTopic = 'bridge/log';

      const ackMessage = {
        type: 'device_force_removed',
        message: id,
      };
      this.mqtt.publish(ackTopic, JSON.stringify(ackMessage));
      break;
    }
    default: {
      // const isGet = new RegExp('/get').test(topic);
      const splitted = topic.split('/');
      const id = splitted[1];
      const parsedMessage = JSON.parse(message);
      const {
        path,
        method,
        queryParams,
        body,
      } = parsedMessage;
      logger.info(parsedMessage);
      const instance = handler.get(id);
      let data;
      try {
        // if (isGet) {
        data = await instance.request(path, method, queryParams, body);
        //  } else {
        // data = await instance.set(path, method, queryParams, body);
        // }
        const ackTopic = id;
        const ackMessage = {
          type: 'data',
          message: {
            data,
          },
        };
        this.mqtt.publish(ackTopic, JSON.stringify(ackMessage));
      } catch (err) {
        console.log(err);
      }
    }
      break;
  }
};
