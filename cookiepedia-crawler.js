const puppeteer = require('puppeteer');
const fs = require('fs');

let cookie_names = require('./cookie_names.json');

//console.log(cookie_names);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const base_url = 'https://cookiepedia.co.uk/cookies/';

    let result = [];
    for (let url of Object.keys(cookie_names)) {
        let cookie_purposes = [];
        for (let cookie_name of cookie_names[url]) {
            await page.goto(base_url + cookie_name);
            const description = await page.$eval('#content-left > p', el => el.textContent);
            const purpose = await page.$eval('#content-left > p > strong', el => el.textContent);
            cookie_purposes.push({
                name: cookie_name,
                description: description,
                purpose: purpose
            });
        }
        result.push({
            url: url,
            cookies: cookie_purposes
        });
    }

    console.log(result);

    fs.writeFile ("result.json", JSON.stringify(result), function(err) {
        if (err) throw err;
            console.log('complete');
        }
    );

    await browser.close();
})();

