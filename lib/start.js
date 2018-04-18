const Hello = require('../lib/hello');
const id = require('../lib/id');
const nodes = require('../lib/nodes');
const messages = require('../lib/messages');

module.exports = function(type, broadcastTypes)
{
	const hello = new Hello(type);
	const uid = id.uid;

	messages.listen();

	hello.on('hello', function(message, rinfo)
	{
		var isMe = id.isMyIp(rinfo.address) && message.data.type === type;

		if (!isMe) {
			nodes.add(message.data.uid, rinfo.address, message.data.port);
			nodes.send(message.data.uid, 'introduction', {uid:uid, type: 'controller', address: id.getRealIp(), port: global.messagePort});
		}
	});

	broadcastTypes.forEach(function(btype)
	{
		hello.hello(btype, {type: type, uid: uid, port: messagePort});
	});
}


