
const puppeteer = require('puppeteer') // website interaction
const fs = require('fs'); // write in a file
require('dotenv').config(); // .env access

(async () => {

	// launch a browser
	const browser = await puppeteer.launch();
	// access a browser
	const page = await browser.newPage();

	// change screenshot's size
	await page.setViewport({
		width: 1980,
		height: 5000,
		deviceScaleFactor: 1,
	});

	// go to a specific page
	await page.goto('https://www.qtermin.de/qtermin-stadtheilbronn-abh');

	// select a category (here is residence permit last name Ku-Z)
	await page.waitForSelector('#iarrow71555');
	await page.click('#iarrow71555');

	// select a service (here is a residence permit extension)
	await page.click('#\\31 74045');

	// continue (weiter zur terminauswahl)
	await page.waitForSelector('#bp1');
	await page.click('#bp1');

	await page.waitForSelector('#p2');
	await waitForMS(3000);

	// date and time selection
	const month = await page.$eval('.ui-datepicker-month', el => +el.value + 1);
	if (month == 0) {
		console.error('no available month');
	} else if (month == 8) { // change a needed month here
		const availableDates = await getAvailableDates(page, 15, 20); // change a needed dates range here
		if(availableDates == null)
			console.error('no available dates');

		fs.writeFile('slot.txt',
			'Month: ' + month + '\n' + 'Available dates: ' + availableDates + '\n', (err) => {
			if (err) throw err;
			console.log('Available dates has been written to the file');
		});

		// pick up a date
		const date = availableDates[0]; // change an available date only here!
		await page.click(`a[data-date="${date}"]`);
		await waitForMS(3000);
		await page.click('#slot1');
		const time = await page.$eval('#slot1', el => el.textContent); // pick up a first available time slot, can be changed here
		await waitForMS(3000);

		fs.appendFile('slot.txt', 'Selected date and time: ' + date + '.' + month + '. at ' + time, (err) => {
			if (err) throw err;
			console.log('Selected date has been written to the file');
		});
	}

	// fill in data
	await fillDataIn(page);
	await waitForMS(3000);

	// make a screenshot with filled in data
	await page.screenshot({path: 'screenshot.png'});

	await browser.close();
})();

async function fillDataIn(page) {

	await page.$eval('#f542389 select', el => el.value = 'Frau'); // salutation can be changed here

	await page.$eval('#f542397 select', el => el.value = ' Heilbronn'); // city can be changed here

	await page.click('#f542392 input');
	await page.type('#f542392', process.env.LAST_NAME);

	await page.click('#f542393 input');
	await page.type('#f542393', process.env.FIRST_NAME);

	await page.click('#f542394 input');
	await page.type('#f542394', process.env.BIRTHDAY);

	await page.click('#f542398 input');
	await page.type('#f542398', process.env.PHONE);

	await page.click('#f542399 input');
	await page.type('#f542399', process.env.EMAIL);
}

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
