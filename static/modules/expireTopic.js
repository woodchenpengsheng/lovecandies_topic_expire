'use strict';

/*
	This file is located in the "modules" block of plugin.json
	It is only loaded when the user navigates to /expiretopic page
	It is not bundled into the min file that is served on the first load of the page.
*/

define('forum/topic/expireTopic', ['alerts', 'api'], function (alerts, api) {
	var expireTopic = {};
	let dateInput;
	let timeInput;

	function topicCommand(method, path, command, tid, onComplete) {
		if (!onComplete) {
			onComplete = function() {}
		}

		const body = {};
		const execute = function (ok) {
			if (ok) {
				api[method](`/topics/${tid}${path}`, body)
					.then(onComplete)
					.catch(alerts.error);
			}
		};

		switch (command) {
			case "expire": {
				expireTopic.requestExpiry(body, execute.bind(null, true));
				break;
			}
			default:
				execute(true);
				break;
		}
	}

	expireTopic.init = function (tid, topicContainer) {
        topicContainer.on('click', '.expire-topic', function () {
			// 弹出一个设置时间的面板，然后将这个时间存储
            // 将这个主题标题成免费的
			topicCommand('put', '/expireTopic', "expire", tid);
			return false;
		});

		topicContainer.on('click', '.unexpire-topic', function () {
			topicCommand('del', '/expireTopic', 'unexpire', tid);
			return false;
		});
	};

	function initModal(ev) {
		const expireContainer = ev.target.querySelector('.datetime-picker');
		dateInput = expireContainer.querySelector('input[type="date"]');
		timeInput = expireContainer.querySelector('input[type="time"]');
	}

	expireTopic.requestExpiry = function (body, onSuccess) {
		app.parseAndTranslate('modals/set-topic-expire', {}, function (html) {
			const modal = bootbox.dialog({
				title: '[[expireTopic:title]]',
				message: html,
				onEscape: true,
				onShown: initModal,
				className: 'topic-expire',
				buttons: {
					cancel: {
						label: '[[modules:bootbox.cancel]]',
						className: 'btn-link',
					},
					save: {
						label: '[[global:save]]',
						className: 'btn-primary',
						callback: function () {
							const bothFilled = dateInput.value && timeInput.value;
							const timestamp = new Date(`${dateInput.value} ${timeInput.value}`).getTime();
							if (!bothFilled || isNaN(timestamp) || timestamp < Date.now()) {
								body.expire = new Date().getTime();
								onSuccess();
							} else {
								body.expire = new Date(timestamp).getTime();
								onSuccess();
							}
						},
					},
				},
			});
		});
	};

    return expireTopic;
});
