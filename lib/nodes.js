const net = require('net');
const consts = require('./consts');
const messages = require('./messages');
const Defer = require('./defer');
var nodes = {};
var pending = {};
var pendingCount = 0;

messages.register('response', function(object)
{
	var defer = pending[object.responseId];
	if (!defer) return;

	defer.resolve(object.response);
	delete pending[object.responseId];
});

messages.register('response-error', function(object)
{
	var defer = pending[object.responseId];
	if (!defer) return;

	defer.reject(object.response);
	delete pending[object.responseId];
});

function add(uid, address, port)
{
	if (nodes[uid]) return nodes[uid];
	nodes[uid] = {address: address, port: port};
	return nodes[uid];
}

function getSocket(uid)
{
	var node = nodes[uid];

	if (!node) return Promise.reject(new Error('Missing node:' + uid));
	if (node.socket) return Promise.resolve(node.socket);
	if (node.waiting) return node.waiting;

	node.waiting = new Promise(function(resolve, reject) {
		var socket = new net.Socket();
		socket.on('connect', function()
		{
			console.log('connected to socket', node);
			node.socket = socket;
			resolve(socket)
			delete node.waiting;
		});

		socket.on('close', function(errored)
		{
			console.log('closed', node);
			delete node.socket
		});

		socket.on('error', function(error)
		{
			console.log(error);
		});

		socket.connect(node.port, node.address);
	});

	return node.waiting;
}

function write(socket, data)
{
	console.log('write', data);
	return new Promise(function(resolve, reject)
	{
		socket.write(data, 'utf8', function()
		{
			resolve();
		});
	});
}

async function ask(uid, type, data)
{
	var responseId = 'response_' +  pendingCount;
	var deferred = new Defer();
	pendingCount++;

	data.responseId = responseId;
	data.uid = uid;

	pending[responseId] = deferred;

	send(uid, type, data);

	return deferred.promise;
}

async function send(uid, type, data)
{
	var socket = await getSocket(uid);

	var message = {type: type, data: data};
	var json = JSON.stringify(message);
	var length = json.length + '';

	var toSend = consts.startOfHeader + length.padStart(consts.headerLength - 1) + json;

	return await write(socket, toSend);
}

async function respond(data, response)
{
	if (!data.responseId || !data.uid) return;
	send(data.uid, 'response', {responseId: data.responseId, response: response});
}

function isConnected(uid)
{
	return nodes[uid] && !!nodes[uid].socket;
}

module.exports = {
	add: add,
	send: send,
	isConnected: isConnected,
};
