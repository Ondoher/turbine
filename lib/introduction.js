const messages = require('./messages');
const nodes = require('./nodes');

var controllers = [];

messages.register('introduction', function(object)
{
	var node = nodes.add(object.uid, object.address, object.port);
	if (object.type === 'controller') controllers.push(node);
});
