(function () {
	const colorChanges = {
		'#17a2b8': '#40bbf5',
		"rgba(211,158,0,0.5)": "#f5c453"
	}
	const keys = Object.keys(colorChanges)
	
	const checkAndReplaceBackgroundColor = (data) => {
		if (typeof (data.backgroundColor) === 'object') {
			for (let i = 0; i < data.backgroundColor.length; i++) {
				if (keys.includes(data.backgroundColor[i])) {
					data.backgroundColor[i] = colorChanges[data.backgroundColor[i]]
				} else {
					data.backgroundColor[i] = 'red';
				}
			}
		}
		else {
			if (keys.includes(data.backgroundColor)) {
				data.backgroundColor = colorChanges[data.backgroundColor]
			}
			// else {
			// 	data.backgroundColor = 'red';
			// }
		}
	}

	Chart.helpers.each(Chart.instances, function (instance) {
		for (const data of instance.data.datasets) {
			checkAndReplaceBackgroundColor(data)
		}

		const changeItemColor = (item) => {
			item.scaleLabel.fontColor = 'white';
			item.ticks.fontColor = 'white';
			item.ticks.minor.fontColor = 'white';
			item.ticks.major.fontColor = 'white';
		};

		instance.options.scales.xAxes.forEach((item) => changeItemColor(item));
		instance.options.scales.yAxes.forEach((item) => changeItemColor(item));
		
		if (instance._plugins && instance._plugins.descriptors) {
			const datalabels = instance._plugins.descriptors.find(x => x.plugin.id === 'datalabels')
			if (datalabels) {
				datalabels.options.color = 'rgba(255, 255, 255, 0.8)'
			}
		}
		
		instance.update()
	})
})() 

