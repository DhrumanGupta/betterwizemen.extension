const scriptByPath = Object.freeze({
	'/': [
		'https://unpkg.com/tesseract.js@2.1.5/dist/tesseract.min.js',
		'noCaptcha.js',
	]
})

function addScript(names) {
	for (let name of names) {
		const s = document.createElement('script');
		// s.async = true;
		s.src = name.startsWith('http') ? name : chrome.runtime.getURL('injections/' + name);
		s.onload = function () {
			this.remove();
		};
		(document.head || document.documentElement).appendChild(s);
	}
}

if (Object.keys(scriptByPath).includes(window.location.pathname)) {
	addScript(scriptByPath[window.location.pathname])
}