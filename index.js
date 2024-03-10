
const puppeteer = require('puppeteer')
const fs = require('fs');

(async () => {
	const browser = await puppeteer.launch(); // launch a browser
	const page = await browser.newPage(); // access browser

	// change screenshot size
	await page.setViewport({
		width: 1980,
		height: 5000,
		deviceScaleFactor: 1,
	});

	await page.goto('https://www.qtermin.de/qtermin-stadtheilbronn-abh'); // go to specific page

	// select category
	await page.waitForSelector('#iarrow71555');
	await page.click('#iarrow71555');

	// select service
	await page.click('#\\31 74045');

	// weiter zur terminauswahl
	await page.waitForSelector('#bp1');
	await page.click('#bp1');

	await page.waitForSelector('#p2');
	await waitForMS(3000);

	const month = await page.$eval('.ui-datepicker-month', el => +el.value + 1);
	if (month == 0) {
		console.log('no available month');
	} else if (month == 8) {
		const availableDates = await getAvailableDates(page, 15, 20); // change a dates range here
		if(availableDates == null)
			console.error('no available dates');

		fs.writeFile('slot.txt',
			'Month: ' + month + '\n' + 'Available dates: ' + availableDates + '\n', (err) => {
			if (err) throw err;
			console.log('Available dates has been written to the file');
		});

		const date = availableDates[0]; // change available date only here!
		await page.click(`a[data-date="${date}"]`);
		await waitForMS(3000);
		await page.click('#slot1');
		const time = await page.$eval('#slot1', el => el.textContent);
		await waitForMS(3000);

		fs.appendFile('slot.txt', 'Selected date and time: ' + date + '.' + month + '. at ' + time, (err) => {
			if (err) throw err;
			console.log('Selected date has been written to the file');
		});
	}

	await page.screenshot({path: 'screenshot.png'});

	await browser.close();
})();

async function getAvailableDates(page, min, max) { // min == first available date, max == last available date
	const availableDates = await page.$$eval('.ui-datepicker-calendar td[data-handler="selectDay"] a', elements => {
		return Array.from(elements).map(x => +x.getAttribute('data-date'));
	});

	if (availableDates.length === 0)
		return null;

	const filteredDates = availableDates.filter(date => date >= min && date <= max);

	if (filteredDates.length === 0)
		return null;

	return filteredDates;
}

function waitForMS(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// alert()

// (async () => {
// 	const host = 'https://www.qtermin.de';
// 	const path = '/api/timeslots?date=2024-09-01&serviceid=174045&capacity=1&caching=false&duration=20&cluster=false&slottype=0&fillcalendarstrategy=0&showavcap=false&appfuture=180&appdeadline=1920&msdcm=0&oneoff=null&appdeadlinewm=2&tz=W.%20Europe%20Standard%20Time&tzaccount=W.%20Europe%20Standard%20Time&calendarid=';

// 	const headers = {
// 		// ':authority:': 'www.qtermin.de',
// 		// ':method:': 'GET',
// 		// ':path:': path,
// 		// ':scheme:': 'https',
// 		'Cookie': 'eTerminSessionId=plugcosk1i3lnw2s3aspjrf3'
// 	};

// 	const response = await fetch(host + path, {
// 		method: 'GET',
// 		headers
// 	});

// 	if(!response.ok)
// 		return console.error('Request failed', response.status);

// 	const data = await response.json();

// 	console.log(data)
// })();