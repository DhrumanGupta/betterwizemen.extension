const options = {}

async function getCurrentTab() {
	let queryOptions = {active: true, currentWindow: true};
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

const isWizemenDomain = async () => {
	const domain = (await getCurrentTab()).url;
	return (new RegExp(/^https:\/\/(.*).wizemen.net/)).test(domain)
}

document.addEventListener('DOMContentLoaded', async (event) => {
	const home = document.getElementById("home")
	const info = document.getElementById("info")
	const infoButton = document.getElementById("info-button")

	const darkModeSwitch = document.getElementById("toggle-dark-mode");
	
	const isValidDomain = await isWizemenDomain();
	(isValidDomain ? document.getElementById('website-only') : document.getElementById('non-website')).style = null;

	chrome.storage.sync.get('options', (result) => {
		Object.assign(options, result ? result.options : {})

		// Set default values
		options.isDark = options.isDark !== undefined ? options.isDark : true
		darkModeSwitch.checked = options.isDark;
	})

	let homeHidden = false;
	const hiddenClassName = "hidden"

	infoButton.onclick = () => {
		homeHidden = !homeHidden;
		if (homeHidden) {
			info.classList.remove(hiddenClassName)
			home.classList.add(hiddenClassName)
			infoButton.setAttribute('selected', 'true');
		} else {
			info.classList.add(hiddenClassName)
			home.classList.remove(hiddenClassName)
			infoButton.removeAttribute('selected');
		}
	}

	darkModeSwitch.onchange = function (e) {
		if (options.isDark === e.target.checked) return;
		options.isDark = e.target.checked;
		chrome.storage.sync.set({options})
	}
});
