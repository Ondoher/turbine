const messages = require('./messages');
const nodes = require('./nodes');
var controllers = [];
var mainController;

messages.register('introduction', function(object)
{
	console.log('introduced', object);
	if (object.type === 'controller') controllers.push(obect.uid);
});

function getController()
{
	if (mainController) return mainController;

	var promises = controllers.map(function(uid) {
		return nodes.ask(uid, 'bid-on', {type: 'controller'});
	});

	return Promise.allSettled(promises)
		.then(function(responses)
		{
			var lowest;
			var controller;

			responses.forEach(function(response)
			{
				if (lowest === undefined || response.value.bid < lowest)
				{
						lowest = response.value.bid;
						controller = response.value.uid;
				}
			});

			mainController = controller;

			return mainController;
		});
}

async function bid(type, data)
{
	var promises =[];

	controller = await getController();

	if (!controller) throw (new Error('no Controller');

	return nodes.ask(controller, 'bid-on', {type: type, data: data})x
}


