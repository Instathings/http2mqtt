# http2mqtt 

## Configuration

To start the http2mqtt service you will need a `configuration.yaml` in the `data` folder.

### configuration.yaml

Minimal configuration looks like this:

```
mqtt:
  base_topic: http2mqtt
  server: 'mqtt://localhost'
```
## Topics

### Add a new device

#### http2mqtt/configure/set

Payload:
- id: a unique string for you
- protocol: the protocol to use, choose between `http`/`https`
- hostname: the hostname you want to connect to. It can be either an IP address or a domain name.
- port: the port to connect
- model: the model of your wifi device

```
{
    id: 'uniqueStringId',
    protocol: 'http'
    hostname: 'host.com'
    model: shplg-s
}
```

### Remove a device

#### http2mqtt/bridge/config/force_remove

Payload:
- id: the id of the device to remove

This payload must be sent as a string not as a JSON object.

### Read data of a device

#### http2mqtt/:id

You can subscribe to this topic in order to receive data from the device.
