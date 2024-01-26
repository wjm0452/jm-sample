// sw.js
self.addEventListener('push', event => {
	const { title, body } = event.data.json().notification
	const options = {
		body
	};

	console.log(options);

	event.waitUntil(self.registration.showNotification(title, options));
});
