global.messagePort = 8001;

const start = require('../lib/start');
const introduction = require('../lib/introduction');
const nodes = require('../lib/nodes');
const id = require('../lib/id');
const messages = require('../lib/messages');

var controllerBid = Math.floor(Math.random() * 0xffffff);

start('controller', ['data', 'controller']);

messages.register('bid-on', function(data)
{
	if (data.type === 'controller')
	{
		nodes.respond(data, {uid: id.uid, bid: controllerBid});
	}
});





