const options = {}


document.addEventListener('DOMContentLoaded', async () => {
	const home = document.getElementById("home")
	const info = document.getElementById("info")
	const infoButton = document.getElementById("info-button")
	const darkModeSwitch = document.getElementById("toggle-dark-mode");

	const result = await chrome.storage.sync.get('options')
    Object.assign(options, result ? result.options : {})

    // Set default values
    options.isDark = options.isDark !== undefined ? options.isDark : true
    darkModeSwitch.checked = options.isDark;

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

	darkModeSwitch.onchange = (e) =>  {
		if (options.isDark === e.target.checked) return;
		options.isDark = e.target.checked;
		chrome.storage.sync.set({options})
	}
});
