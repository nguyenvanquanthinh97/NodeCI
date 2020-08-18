const Page = require('./helpers/page');

let page;
beforeEach(async () => {
	page = await Page.build();
	await page.goto('http://localhost:3000');
});

afterEach(async () => {
	await page.close();
});

test('check the brand logo is Blogster text', async () => {
	const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);
	expect(text).toBe('Blogster');
});

test('clicking login start oauth flow', async () => {
	await page.click('ul.right a');
	const url = await page.url();
	// This step can be solved by either 2 methods
	// Method 1: use toContain
	expect(url).toContain('accounts.google.com');
	// Method 2: use toMatch
	expect(url).toMatch(/accounts\.google\.com/);
});

test('when login show logout button', async () => {
	await page.login();

	const text = await page.getContent('a[href="/auth/logout"]');
	expect(text).toBe('Logout');
});
