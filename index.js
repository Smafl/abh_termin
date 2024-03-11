
const puppeteer = require('puppeteer') // website interaction
const fs = require('fs'); // write in a file
require('dotenv').config(); // .env access

(async () => {

	// launch a browser
	const browser = await puppeteer.launch();

	try {

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

		// write html content in a file
		// const htmlContent = await page.content();
		// fs.writeFile('htmlContent.txt', htmlContent, (err) => {
		// 	if (err) throw err;
		// 	console.log('html content has been written to the file');
		// });

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
		let availableMonth = 0;
		const neededMonth = 9; // change a needed month here

		// this selector is accessible
		// from the current month
		// until 6 month ahead only!
		const timePointer = "next"; // can be change to "next" or "prev"

		while (availableMonth != neededMonth)
			availableMonth = await getMonth(page, neededMonth, timePointer);

		const availableDates = await getAvailableDates(page, 1, 30); // change a needed dates range here
		if (availableDates == null)
			throw new Error();
		fs.writeFile('slot.txt',
			'Month: ' + availableMonth + '\n' + 'Available dates: ' + availableDates + '\n', (err) => {
			if (err) throw err;
			console.log('Available dates has been written to the file');
		});

		// pick up a date
		const date = availableDates[0]; // change a date only here if there are more than 1 is available!
		await page.click(`a[data-date="${date}"]`);
		await waitForMS(3000);
		await page.click('#slot1');
		const time = await page.$eval('#slot1', el => el.textContent); // pick up a first available time slot, can be changed here
		await waitForMS(3000);
		fs.appendFile('slot.txt', 'Selected date and time: ' + date + '.' + availableMonth + '. at ' + time, (err) => {
			if (err) throw err;
			console.log('Selected date has been written to the file');
		});

		// fill in data
		await fillDataIn(page);

		// checkbox agreement with data privacy policy
		await page.click('#divUserQueries label[class="chkBox"]:nth-child(2)');

		// make a screenshot with filled in data
		await waitForMS(3000);
		await page.screenshot({path: 'screenshot_data.png'});

		// book a slot
		// try {
		// 	await page.waitForSelector('.wizard');
		// 	await page.click('#cmdBookAppointment');
		// 	console.log('Booked succsessfully');
		// } catch (error) {
		// 	console.error('Booking failed: ', error);
		// }
	} catch(error) {
		console.error(error);
	} finally {
		await browser.close();
	}
})();

async function fillDataIn(page) {

	await page.$eval('#f542389 select', el => el.value = 'Frau'); // salutation can be changed here

	await page.$eval('#f542397 select', el => el.value = ' Heilbronn'); // city can be changed here

	await page.click('#f542392 input');
	await page.type('#f542392', process.env.FIRST_NAME);

	await page.click('#f542393 input');
	await page.type('#f542393', process.env.LAST_NAME);

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

async function getMonth(page, neededMonth, timePointer) {
	let month = await page.$eval('.ui-datepicker-month', el => +el.value + 1);
	while (month != neededMonth) {
		await waitForMS(3000);
		await page.click(`#divDP a[data-handler="${timePointer}"]`);
		await page.waitForSelector('#divDP');
		month = await page.$eval('.ui-datepicker-month', el => +el.value + 1);
	}
	await waitForMS(3000);
	// await page.screenshot({path: 'screenshot_month.png'});
	return month;
}

function waitForMS(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
