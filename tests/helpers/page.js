const puppeteer = require('puppeteer');
const userFactory = require('../factories/userFactory');
const sessionFactory = require('../factories/sessionFactory');

class CustomPage {
	constructor(page) {
		this.page = page;
	}

	static async build() {
		const browser = await puppeteer.launch({
			headless: false
		});

		const page = await browser.newPage();
		const customPage = new CustomPage(page);

		return new Proxy(customPage, {
			get: (target, property) => {
				return target[property] || browser[property] || page[property];
			}
		});
	}

	async login() {
		const user = await userFactory();

		const { session, sign } = sessionFactory(user);
		await this.page.setCookie({ name: 'session', value: session }, { name: 'session.sig', value: sign });
		// await page.setCookie({ name: 'session', value: session });
		// await page.setCookie({ name: 'session.sig', value: sign });

		// await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
		// await page.goto('http://localhost:3000',  { waitUntil: [ 'domcontentloaded', 'networkidle0' ] });

		await this.page.reload();
		await this.page.waitFor('a[href="/auth/logout"]');
	}

	async getContent(selector) {
		return await this.page.$eval(selector, (el) => el.innerHTML);
	}
}

module.exports = CustomPage;
