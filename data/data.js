global.messagePort = 8000;

const Hello = require('../lib/hello');
const id = require('../lib/id');
const nodes = require('../lib/nodes');
const messages = require('../lib/messages');
const introduction = require('../lib/introduction');

const hello = new Hello('data');
const uid = id.uid;

messages.listen();

hello.on('hello', function(message, rinfo)
{
	var isMe = id.isMyIp(rinfo.address) && message.data.type === 'data';
	console.log('rcv', message, rinfo, isMe);

	if (!isMe) {
		console.log('others');
		nodes.add(message.data.uid, rinfo.address, message.data.port);
		nodes.send(message.data.uid, 'introduction', {uid:uid, type: 'data', address: id.getRealIp(), port: global.messagePort});
	}
});

hello.hello('data', {type: 'data', uid: uid, port: messagePort});
hello.hello('controller', {type: 'data', uid: uid, port: messagePort});





