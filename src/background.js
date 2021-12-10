chrome.notifications.onButtonClicked.addListener(async notificationId => {
    await chrome.tabs.create({url: notificationId})

})
chrome.runtime.onMessage.addListener(async (meetings, sender, sendResponse) => {
    const url = new URL(sender.url)
    const acceptedHostnames = ["psn.wizemen.net", "psg.wizemen.net", "pws.wizemen.net"]
    if (acceptedHostnames.indexOf(url.hostname) === -1) return
    await chrome.alarms.clearAll()

    const result = await chrome.storage.sync.get('options')
    const options = (result && result.options) ? result.options : {};

    // Set default values
    options.launchTimeout = options.launchTimeout !== undefined ? options.launchTimeout : 0
    options.notifyTimeout = options.notifyTimeout !== undefined ? options.notifyTimeout : -1*1000*60*5


    for (const meeting of meetings){
        const url = new URL(meeting.join_url)

        // https://developer.chrome.com/docs/extensions/mv3/messaging/#content-scripts-are-less-trustworthy
        // TODO add teams launch url
        const acceptedHostnames = ["us06web.zoom.us"]
        if (acceptedHostnames.indexOf(url.hostname) === -1) continue

        const timestamp = getMeetingUnixTimestamp(meeting)
        const launchTimestamp = timestamp + options.launchTimeout
        const notifyTimestamp = timestamp + options.notifyTimeout
        const now = new Date().getTime()


        if (options.launchTimeout !== 0 && launchTimestamp > now){
            chrome.alarms.create("launch;"+meeting.join_url, {when: launchTimestamp})
        }
        if (options.notifyTimeout !== 0 && notifyTimestamp > now){
            chrome.alarms.create("notify;"+meeting.join_url, {when: notifyTimestamp})
        }
    }

    await chrome.storage.local.set({meetings})

    sendResponse({})




})

chrome.alarms.onAlarm.addListener(async alarm => {
    const protocol = alarm.name.split(";")[0]
    const url = alarm.name.split(";")[1]
    if (protocol === "notify"){
        const data = await chrome.storage.local.get(['meetings'])
        const meeting = data.meetings.find(meeting => meeting.join_url === url)
        const timeDifference = getMeetingUnixTimestamp(meeting) - new Date().getTime()
        const message = `Your ${meeting.topic} class starts in ${Math.floor(timeDifference/(1000*60))} minutes!`
        chrome.notifications.create(meeting.join_url, {iconUrl: "icon.png", message, title: "Better Wizemen", buttons: [{title: "Join"}], type: "basic"})
        return
    }
    if (protocol === "launch"){
        await chrome.tabs.create({url})
    }
})

chrome.storage.onChanged.addListener(async changes => {
    if (!changes.options) return;
    const options = changes.options.newValue
    const oldOptions = changes.options.oldValue
    if (options.launchTimestamp !== oldOptions.launchTimestamp || options.notifyTimestamp !== oldOptions.notifyTimestamp){
        // TODO switch to wiz.js + service workers and refresh meetings also when reaching this step (along with every x minutes) 
        await chrome.alarms.clearAll()
        await chrome.storage.local.remove('meetings')
    }

})
function getMeetingUnixTimestamp(meeting){
     return  subtractTimezoneOffset(
                convertWordyDateToUnixTimestamp(meeting.start_date) +
                convertTimeToUnixTimestamp(meeting.start_time),
            )

}
//from wiz.js
function convertTimeToUnixTimestamp(time, is12Hour = true) {
    if (is12Hour) {
        const [parsedTime, AMPM] = time.split(' ')
        let [hours, minutes] = parsedTime.split(':')
        if (AMPM === 'PM') {
            if (hours != 12) {
                hours = 12 + +hours
            }
        } else {
            if (hours === '12' && minutes === '00') {
                return Date.UTC(1970, 0, 1)
            }
        }

        return Date.UTC(1970, 0, 1, hours, minutes)
    }
    const [hours, minutes] = time.split(':')
    return Date.UTC(1970, 0, 1, hours, minutes)
}

function convertWordyDateToUnixTimestamp(
    wordyDate,
    dateSeperator = '-',
    isMonthFirst = false,
) {

    let date
    let monthName
    let year
    if (isMonthFirst) {
        const data = wordyDate.split(dateSeperator)
        monthName = data[0]
        date = data[1]
        year = data[2]
    } else {
        const data = wordyDate.split(dateSeperator)
        date = data[0]
        monthName = data[1]
        year = data[2]
    }
    const month = 'JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(monthName) / 3
    return Date.UTC(year, month, date)
}

function subtractTimezoneOffset(time) {
    return time - (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
}

