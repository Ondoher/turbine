Promise.allSettled = function(list)
{
	function wrap(promise)
	{
		return new Promise(function(resolve, reject)
		{
			promise
				.then(function(value)
				{
					resolve({state: 'resolved', value: value});
				})
				.catch(function(error)
				{
					resolve({state: 'rejected', error: error});
				});
		}.bind(this));
	}

	var wrapped = list.map(function(promise)
	{
		return wrap(promise);
	});

	Promise.all(wrapped);
}

