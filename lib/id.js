const os = require('os');
const ifaces = os.networkInterfaces();
const uuid = require('uuid/v4');
const uid = uuid();
var realIp;
var ips = [];

Object.keys(ifaces).forEach(function (ifname) {
	var alias = 0;

	ifaces[ifname].forEach(function (iface) {
	// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		if ('IPv4' !== iface.family || iface.internal !== false) return;

		ips.push(iface.address);
	});
});

exports.uid = uid;

exports.setIp = function (address)
{
	realIp = address;
}

exports.getRealIp = function()
{
	return '127.0.0.1';
	return realIp || ips[0];
}

exports.isMyIp = function (address)
{
	var me = (ips.indexOf(address) !== -1);
	if (!realIp) realIp = address;
	return me;
}
