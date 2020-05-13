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
      } = parsedMessage;
      const ipAddress = parsedMessage.ip_address;
      settings.addDevice(id, ipAddress, model);
      const instance = new Http(this.mqtt, parsedMessage);
      try {
        await instance.start();
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
      const isGet = new RegExp('/get').test(topic);
      const splitted = topic.split('/');
      const id = splitted[1];
      const parsedMessage = JSON.parse(message);
      const { options, actionId, queryParams, body } = parsedMessage;
      logger.info(parsedMessage);
      const instance = handler.get(id);
      let data;
      try {
        if (isGet) {
          data = await instance.get(actionId, queryParams);
        } else {
          data = await instance.set(actionId, queryParams, body, options);
        }
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
