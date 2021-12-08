// ALL functions end with BetterWizemen just to prevent issues in other areas

let button;
const changeButtonBetterWizemen = () => {
	button = $("#butLogin")
	const parent = button.parent()
	button.remove()
	button = parent.append('<button id="betterWizemenButton" type="button" style="width:100px;" class="btn btn-wizemen-primary btn-block btn-flat pull-right">Sign In</button>')
}

const validateEmailBetterWizemen = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

async function onLoginSuccessBetterWizemen(data, emailId, pwd, rememberMe) {
	if (data.length <= 0) {
		hideWaitingMessage();
		showMessageDialog("Sorry!", "Could not log you in.<br />Please get your user profile checked by the school ERP coordinator", "warning");
		button.removeAttr("disabled");
		return;
	}

	if (data.substring(0, 7) !== "success") {
		hideWaitingMessage();
		if (data.substring(0, 9) === "disabled:") {
			$("#chkRememberMe").prop("checked", false);
			let stat = data.substring(9);
			if (stat.trim().length <= 0) {
				stat = "Wizemen portal has currently been disabled for necessary updates.";
			}
			showMessageDialog("Wizemen Disabled", stat, "info");
		} else if (data === "cantremember") {
			showMessageDialog("Alert!", "You cannot remember an impersonated account", "warning");
		} else if (data === "Invalid security Code entered") {
			await loadNewCaptchaBetterWizemen()
			await loginBetterWizemen(emailId, pwd, rememberMe)
		} else {
			button.removeAttr("disabled");
		}
	} else {
		const responsedata = data.split(':')[0];
		const remember_me_token = data.split(':')[1];
		if (remember_me_token == null || remember_me_token === "") {
			try {
				localStorage.removeItem("remember_me_token");
			} catch (err) {
			}
		} else {
			try {
				localStorage.setItem("remember_me_token", remember_me_token);
			} catch (err) {
			}
		}

		if (responsedata === "success_Faculty") {
			if (autoredirect === "yes") {
				window.location.href = "/launchpadnew?portalpath=" + portalpath + "&pagepath=" + pagepath + "&autoredirect=" + autoredirect + "&param=" + param;
				window.location.href = "/launchpadnew";
			} else {
				window.location.href = "/launchpadnew";
			}
		} else if (responsedata === "success_Student") {
			if (autoredirect === "yes") {
				window.location.href = "/launchpadnew?portalpath=" + portalpath + "&pagepath=" + pagepath + "&autoredirect=" + autoredirect + "&param=" + param;
			} else {
				window.location.href = "/launchpadnew";
			}

		} else if (responsedata === "success_Parent") {
			if (autoredirect === "yes") {
				window.location.href = "/launchpad?portalpath=" + portalpath + "&pagepath=" + pagepath + "&autoredirect=" + autoredirect + "&param=" + param;
			} else {
				launchParentPortalDirect();
			}
		} else if (responsedata === "success_Staff") {
			if (autoredirect === "yes") {
				window.location.href = "/launchpadnew?portalpath=" + portalpath + "&pagepath=" + pagepath + "&autoredirect=" + autoredirect + "&param=" + param;
			} else {
				window.location.href = "/launchpadnew";
			}
		} else if (responsedata === "success_Admin") {
			if (autoredirect === "yes") {
				window.location.href = "/launchpadnew?portalpath=" + portalpath + "&pagepath=" + pagepath + "&autoredirect=" + autoredirect + "&param=" + param;
			} else {
				window.location.href = "/launchpadnew";
			}
		} else if (responsedata === "fail_Admin") {
			hideWaitingMessage();
			showMessageDialog("Invalid Impersonation", "You cannot Impersonate an Admin.", "error");
			button.removeAttr("disabled");
		}

	}

}

const loadNewCaptchaBetterWizemen = async () => {
	try {
		const resp = await fetch('/Home/getCaptchaImage', {
			cache: 'no-cache',
		})
		$('#imgCaptcha').attr("src", await resp.text());
	} catch {
	}
}

let captchaWorkerBetterWizemen = undefined;
const getCaptchaWorkerBetterWizemen = async () => {
	if (!captchaWorkerBetterWizemen) {
		captchaWorkerBetterWizemen = Tesseract.createWorker();
		await captchaWorkerBetterWizemen.load();
		await captchaWorkerBetterWizemen.loadLanguage('eng');
		await captchaWorkerBetterWizemen.initialize('eng');
	}

	return captchaWorkerBetterWizemen
}

async function loginBetterWizemen(emailId, pwd, rememberMe) {
	const workerBetterWizemen = await getCaptchaWorkerBetterWizemen()
	const captcha = await workerBetterWizemen.recognize(document.getElementById('imgCaptcha'), 'eng')

	try {
		const resp = await fetch('/homecontrollers/login/validateUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({
				emailid: emailId,
				pwd: pwd,
				schoolCode: schoolCode,
				schoolName: schoolName,
				captcha: captcha.data.text.trim().replace(/\n/g, '').replace(/\b/g, ''),
				rememberMe: rememberMe
			})
		})

		const data = await resp.text()
		await onLoginSuccessBetterWizemen(data.slice(1, -1), emailId, pwd, rememberMe)
	} catch (e) {
		hideWaitingMessage();
		showMessageDialog("Oops!", 'Something went wrong. Please check your internet connection, or try again later. If the issue persists, please contact an administrator', "error");
		button.removeAttr("disabled");
	}
}

// taken from wizemen, very messy
async function runTestsBetterWizemen(button) {
	button.attr("disabled", "disabled");
	showWaitingMessage("Please wait while we validate you...");
	const error = {};
	const emailId = $("#userEmail").val().trim();
	const pwd = $("#userPassword").val().trim();
	const rememberMe = $("#chkRememberMe").prop("checked")

	if (!validateEmailBetterWizemen(emailId)) {
		error.title = "Invalid email"
		error.message = "Please check the Email entered"
	} else if (emailId.length <= 0) {
		error.title = "Password Not Entered"
		error.message = "Please enter a password"
	} else if (schoolCode === null || schoolCode.length <= 0) {
		error.title = "Data was not loaded"
		error.message = "You clicked login too fast (lmao gg)! Please wait for the data to load"
	} else if (emailId.indexOf('/') >= 0 && rememberMe === true) {
		error.title = "Aha!"
		error.message = "You cannot initiate remember me while impersonating someone (what even is this lol)"
	}

	if (Object.keys(error).length > 0) {
		hideWaitingMessage();
		showMessageDialog(error.title, error.message, "error")
		button.removeAttr("disabled");
		return
	}

	await loginBetterWizemen(emailId, pwd, rememberMe)
}

function mainBetterWizemen() {
	$("#imgCaptcha").parent().attr('style', 'display: none !important;')

	document.getElementById('betterWizemenButton').onclick = async () => {
		await runTestsBetterWizemen(button)
	}
}

changeButtonBetterWizemen();
mainBetterWizemen()