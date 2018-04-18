const net = require('net');
const EventEmitter = require('events');
const consts = require('./consts');

class MessageServer extends EventEmitter {
	constructor()
	{
		super();
		this.incoming = '';
		this.sockets = [];
		this.listeners = new EventEmitter();

		this.server =  net.createServer();
		this.server.on('connection', this.onConnect.bind(this));
		console.log('created');
	}

	listen ()
	{
		console.log('listening');
		this.server.listen(global.messagePort);
	}

	register (type, callback)
	{
		this.listeners.on(type, callback);
	}

	unregister (type, callback)
	{
		this.listeners.off(type, callback);
	}

	getObjectLength ()
	{
		console.log(this.incoming);
		var header = this.incoming.slice(0, consts.headerLength);
		var length = parseInt(header.slice(1, consts.headerLength), 10);
		console.log(header, length);
		return length;
	}

	getOne ()
	{
		console.log('getOne', this.incoming);
		var startOfHeader = consts.startOfHeader;
		var start;
		var json;
		var length;
		var object;

	// in case of damaged data, find the next header
		start = this.incoming.indexOf(startOfHeader);
		if (start === -1) return;
		this.incoming = this.incoming.slice(start);

	// get the length of the next object, make sure there is enough data in the buffer
		if (this.incoming.length < consts.headerLength) return;
		length = this.getObjectLength();
		if (this.incoming.length < length + consts.headerLength) return;

	// get the object out of the buffer
		this.incoming = this.incoming.slice(consts.headerLength);
		json = this.incoming.slice(0, length);
		this.incoming = this.incoming.slice(length);

		try
		{
			object = JSON.parse(json);
			return object;
		}
		catch (e)
		{
			console.warn(e.stack);
			console.warn(json);
		}
	}

	processFeed ()
	{
		var object = this.getOne();
		while (object)
		{
			console.log('message', object);
			this.emit('data', object);
			this.listeners.emit(object.type, object.data);
			var object = this.getOne();
		}
	}

	onData (socket, data)
	{
		console.info('on data', data);
		this.incoming += data;
		this.processFeed();
	}

	onClose ()
	{
	}

	onEnd ()
	{
	}

	onError (socket, error)
	{
		console.log('error')
	}

	onConnect (socket)
	{
		this.sockets.push(socket);
		console.log('connected');
		socket.setEncoding('utf8');

		socket.on('data', this.onData.bind(this, socket));
		socket.on('close', this.onClose.bind(this, socket));
		socket.on('end', this.onEnd.bind(this, socket));
		socket.on('error', this.onError.bind(this, socket));
	}
}

module.exports = new MessageServer();
