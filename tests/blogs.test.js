const Page = require('./helpers/page');

let page;

beforeEach(async () => {
	page = await Page.build();

	await page.goto('http://localhost:3000');
});

afterEach(async () => {
	await page.close();
});

describe('When logged in', () => {
	beforeEach(async () => {
		await page.login();

		await page.click('a.btn-floating.btn-large.red');
	});

	test('can see blog create form', async () => {
		const text = await page.getContentsOf('div.title label');

		expect(text).toBe('Blog Title');
	});

	describe('when using invalid input', () => {
		beforeEach(async () => {
			await page.click('button.teal.btn-flat.right.white-text');
		});

		test('submitting show error message', async () => {
			const titleText = await page.getContentsOf('div.title .red-text');
			const contentText = await page.getContentsOf('div.content .red-text');

			expect(titleText).toBe('You must provide a value');
			expect(contentText).toBe('You must provide a value');
		});
	});

	describe('when using valid input', () => {
		beforeEach(async () => {
			await page.type('div.title input[name="title"]', 'My Title');
			await page.type('div.content input[name="content"]', 'My Content');
			await page.click('form button[type="submit"]');
		});

		test('Submitting takes user to review screen', async () => {
			const text = await page.getContentsOf('form h5');
			expect(text).toBe('Please confirm your entries');
		});
		test('Submitting then saving adds blog to index page', async () => {
			await page.click('form button.green');
			await page.waitFor('.card');

			const title = await page.getContentsOf('.card-title');
			const content = await page.getContentsOf('p');

			expect(title).toBe('My Title');
			expect(content).toBe('My Content');
		});
	});
});

describe('When not logged in', () => {
	test('User can not create blog', async () => {
		const result = await page.evaluate(() =>
			fetch('/api/blogs', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ title: 'MY TITLE', content: 'MY CONTENT' })
			}).then((res) => res.json())
		);
		expect(result).toEqual({ error: 'You must log in!' });
	});
	test('User can not retrieve list of blogs', async () => {
		const result = await page.evaluate(() =>
			fetch('/api/blogs', {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((res) => res.json())
		);

		expect(result).toEqual({ error: 'You must log in!' });
	});
});
