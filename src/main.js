const injectScript = (path) => {
	const s = document.createElement('script');
	// s.async = true;
	s.src = chrome.runtime.getURL('injections/' + path);
	(document.head || document.documentElement).appendChild(s);
	return s
}


const injectScripts = () => {
    // Inject scripts based on if regex matches location.pathname
	const scriptByPath = Object.freeze({
		'^\/$': [
			'tesseract.min.js',
			'noCaptcha.js',
		],
	})

	function addScript(names) {
		for (let name of names) {
			injectScript(name)
		}
	}

    for (const path in scriptByPath){
        if (new RegExp(path).test(window.location.pathname)){
            addScript(scriptByPath[path])
        }
    }
}

const setupOptions = () => {
	let wasDark;
    var reloadTimeout;
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
        options.meetingInterval = options.meetingInterval !== undefined ? options.meetingInterval : 1000*60*5

		setTheme(options.isDark)
        updateMeetings(options.meetingInterval, true)
	})

	chrome.storage.onChanged.addListener(function (changes) {
		if (!changes.options) {
			return;
		}
		const options = changes.options.newValue;
        const oldOptions = changes.options.oldValue;
		if (options.isDark !== oldOptions.isDark) {
			setTheme(options.isDark)
		}
        if (options.meetingInterval !== oldOptions.meetingInterval){
            clearTimeout(reloadTimeout)
            updateMeetings(options.meetingInterval, false)
        } 
	});


}

const openPortal = async (portalId) => {
    const sessionvals = await $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: window.location.protocol + "//" + window.location.host + "/homecontrollers/launchpad/openPortal",
        dataType: "json",
        data: JSON.stringify({
            portalCode: `WIZPOR${portalId}`
        }),
    })
    await $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: window.location.protocol + "//" + window.location.host + sessionvals,
    })
}
const getMeeting = async (type) => {
    // TODO authenticate with a portal.
    try
    {
        const data = await $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: window.location.protocol + "//" + window.location.host + "/" + "classes/student/VirtualClass" + type + "Student.aspx/getScheduledMeetings",
            dataType: "json",
            data: JSON.stringify({

            }),
        });
        if (!data.d){
            return console.log("Data object not recieved, recieved: " + data)
        }
        return data.d
    }
    catch (err)
    {
        console.log("Error in getting meetings: ", err)
    }
}
const updateMeetings = async (interval, shouldOpenPortal) => {
    if (interval === 0){
        return;
    }
    if (shouldOpenPortal){
        try{
            await openPortal(6)
        }
        catch (e){
            //user is probably currently logged out.
            console.log("(BetterWizemen): You are probably currently locked out of Wizemen. If you are, you don't need to worry about any of the error messages above or below this one.")
            console.log(e)
            return
        }
    }
    const meetings = await Promise.all([getMeeting("Zoom"), getMeeting("Teams")]) 
    const denestedMeetings = meetings[0].concat(meetings[1])
    chrome.runtime.sendMessage(denestedMeetings, ()=>{
        reloadTimeout = setTimeout(()=>updateMeetings(interval, false), interval)
    })
}

if (window.location.pathname === '/sessionexpired.aspx') {
	window.location.replace('/')
}

injectScripts()
setupOptions()
