const dgram = require('dgram');
const EventEmitter = require('events');

const BROADCAST_ADDRESS = "255.255.255.255";
const HELLO_PORTS = {controller: 8099, data: 8090};

class Hello extends EventEmitter {
	constructor (type)
	{
		super();
		this.type = type;
		this.port = HELLO_PORTS[this.type];

		this.server = dgram.createSocket('udp4');
		this.listen();
	}

	listen ()
	{
		this.server.bind(this.port);
		this.server.on('listening', function()
		{
			this.server.setBroadcast(true);
		}.bind(this));
		this.server.on('message', function(message, rinfo)
		{
			this.emit('hello', JSON.parse(message.toString()), rinfo);
		}.bind(this));
	}

	hello (type, message)
	{
		console.log(type, HELLO_PORTS[type], message);
		this.server.send(JSON.stringify({type: 'hello', data : message}), HELLO_PORTS[type], BROADCAST_ADDRESS);
	}
}

module.exports = Hello;
