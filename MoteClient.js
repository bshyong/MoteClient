#!/usr/bin/env node

var program = require('commander');
var mqtt = require('mqtt');
var uuid = require('node-uuid');

var MQTT_PROTO_PREFIX = 'mqtt://';

program
    .command('initialize')
    .alias('init')
    .description('initialize a connection with Mote server')
    .option('-b, --box <box>', 'Talk to <box>')
    .option('-t, --topic <topic>', 'Subscribe to <topic>')
    .option('-c, --clientId [clientId]', 'clientId used in the session')
    .option('-d, --debug', 'Enable debug mode')
    .action(function(options) {
        var host = options.box;
        console.log(host);
        var connectionUrl = (host.lastIndexOf(MQTT_PROTO_PREFIX, 0) === 0)? host : MQTT_PROTO_PREFIX + host;
        console.log(connectionUrl);
        var clientId = (options.clientId || uuid.v4());
        var client = mqtt.connect(connectionUrl, {
            "clientId": clientId
        });

        client.on('connect', function() {
           console.log('------------------------');
           console.log('Connected to %s', host);
           console.log('------------------------');
        });

        client.on('message', function(topic, msg, packet) {
            console.log('Message: %s', msg.toString());

            if (options.debug) {
                console.log('++++ Packet ++++');
                console.log(packet);
                console.log('++++++++++++++++');
            }
        });

        client.on('close', function() {
        });

        client.subscribe(options.topic);

        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', function() {
            var chunk = process.stdin.read();
            if (chunk !== null) {
                client.publish(options.topic, chunk);
            }
        });

    });

// un-matched command
program
    .command('*')
    .action(function(env) {
        console.log('invalid input: "%s"', env);
        program.outputHelp();
    });

program
    .version('0.0.1')
    .usage('<command> [options]')
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}