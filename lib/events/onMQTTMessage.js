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
        ipAddress,
        model,
      } = parsedMessage;
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
    default:
      break;
  }
};
