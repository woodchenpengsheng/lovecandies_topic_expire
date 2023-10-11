'use strict';

// const nconf = require.main.require('nconf');
// const winston = require.main.require('winston');
// const meta = require.main.require('./src/meta');
// const routeHelpers = require.main.require('./src/routes/helpers');
const user = require.main.require('./src/user');
const privileges =  require.main.require('./src/privileges');

const plugin = {};

plugin.init = async (params) => {
	const { router /* , middleware , controllers */ } = params;
};

plugin.addTopicThreadTools = async function(hookData) {
	const { topic, uid, tools } = hookData;
	const userPrivileges = await privileges.topics.get(topic.tid, uid);
	if (userPrivileges["topics:expire"]) {
		tools.push({ component: "topic/expire", class: `expire-topic ${topic.expire ? "hidden" : ""}`, icon: "fa-solid fa-clock", title: "设置主题的过期时间" });
		tools.push({ component: "topic/unexpire", class: `unexpire-topic ${!topic.expire ? "hidden" : ""}`, icon: "fa-solid fa-power-off", title: "取消过期" });
	}

	return hookData;
}


plugin.getTopicPrivileges = async function(privileges) {
	const { uid, cid } = privileges;
	const [isAdministrator, isModerator] = await Promise.all([
		user.isAdministrator(uid),
		user.isModerator(uid, cid),
	]);

	if (isAdministrator || isModerator) {
		privileges["topics:expire"] = true;
	}

	return privileges;
}

module.exports = plugin;
