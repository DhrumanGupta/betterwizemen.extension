const injectScript = (path) => {
	const s = document.createElement('script');
	// s.async = true;
	s.src = chrome.runtime.getURL('injections/' + path);
	(document.head || document.documentElement).appendChild(s);
	return s
}

const injectScripts = () => {
	const scriptByPath = Object.freeze({
		'/': [
			'tesseract.min.js',
			'noCaptcha.js',
		]
	})

	function addScript(names) {
		for (let name of names) {
			injectScript(name)
		}
	}

	if (Object.keys(scriptByPath).includes(window.location.pathname)) {
		addScript(scriptByPath[window.location.pathname])
	}
}

const setupOptions = () => {
	let wasDark;
	const docElement = (document.head || document.documentElement);
	const setTheme = (isDark) => {
		if (isDark) {
			wasDark = true;
			const style = document.createElement('link');
			style.rel = 'stylesheet'
			style.href = chrome.runtime.getURL('injections/dark_mode.css')
			docElement.appendChild(style)

			injectScript('darkModeChart.js')

			document.body.style.cssText = undefined;
			return
		}

		if (wasDark) {
			location.reload()
		}
	}

	chrome.storage.sync.get('options', (result) => {
		const options = (result && result.options) ? result.options : {};

		// Set default values
		options.isDark = options.isDark !== undefined ? options.isDark : true

		setTheme(options.isDark)
	})

	chrome.storage.onChanged.addListener(function (changes, namespace) {
		if (!changes.options) {
			return;
		}
		const options = changes.options.newValue;
		if (options.isDark !== undefined) {
			setTheme(options.isDark)
		}
	});
}

if (window.location.pathname === '/sessionexpired.aspx') {
	window.location.replace('/')
}

injectScripts()
setupOptions()
