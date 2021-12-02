const scriptByPath = Object.freeze({
	'/': [
		'tesseract.min.js',
		'noCaptcha.js',
	]
})

function addScript(names) {
	for (let name of names) {
		const s = document.createElement('script');
		// s.async = true;
		s.src = chrome.runtime.getURL('injections/' + name);
		s.onload = function () {
			this.remove();
		};
		(document.head || document.documentElement).appendChild(s);
	}
}

if (Object.keys(scriptByPath).includes(window.location.pathname)) {
	addScript(scriptByPath[window.location.pathname])
}