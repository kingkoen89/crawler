const puppeteer = require('puppeteer');
const fs = require('fs');
const fsp = require('fs').promises;
const readline = require('readline');
const LineByLineReader = require('line-by-line');
const performance = require('perf_hooks').performance;
const iPhone = puppeteer.devices['iPhone 6'];

// Clean up and make output folder
(() => {
    let dir = './out';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    } else {
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir);
    }
})();

// Run crawler
(() => {
    let lr = new LineByLineReader('urls.txt');
    lr.on('line', (line) => {
        lr.pause();
        const p = [normalCrawl(line), mobileCrawl(line)];
        Promise.all(p).then(() => { lr.resume() });
    });
    lr.on('end', () => {
        console.log('Successful crawl in', Math.round(performance.now() / 1000), 'seconds.');
    });
})();

const xpath = '//*[self::button or self::a[not(contains(@class, "articleblock"))] or self::div[contains(@class, "cookiescript_accept")]][contains(., "Accepteer") or contains(., "accepteer") or ' +
'contains(., "Akkoord") or contains(., "akkoord") or contains(., "Accepteren") or contains(., "accepteren")]';

async function normalCrawl(url) {
    const urlName = url.replace(/https?\:\/\/www\./, '');
    let dir = './out/' + urlName;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let normalDir = dir + '/normal';
    if (!fs.existsSync(normalDir)) {
        fs.mkdirSync(normalDir);
    }
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForTimeout(2000);

    const frames = page.frames();
    const frame = frames.find(frame => frame.url().includes('cmp'));

    let btn;

    if (frame) {
        await frame.waitForXPath(xpath);
        [btn] = await frame.$x(xpath);
    } else {
        await page.waitForXPath(xpath);
        [btn] = await page.$x(xpath);
    }

    await page.screenshot({ path: normalDir + '/consent_dialog.png' });

    if (btn) {
        await page.setRequestInterception(true);
        await btn.click();
        page.on('request', async (request) => {
            if (request.method() === 'GET') {
                await fsp.appendFile(normalDir + '/GET_traffic.json', request.method().toString() + ' ' + request.url() + '\n');
            } else if (request.method() === 'POST') {
                await fsp.appendFile(normalDir + '/POST_traffic.json', request.method().toString() + ' ' + request.url() + '\n');
            }
            request.continue();
        });
    }

    await page.waitForTimeout(8000);

    const cookies = await page.cookies();
    await fsp.appendFile(normalDir + '/cookies.json', JSON.stringify(cookies, null, 2));

    await browser.close();
};

async function mobileCrawl(url) {
    const urlName = url.replace(/https?\:\/\/www\./, '');
    let dir = './out/' + urlName;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let mobileDir = dir + '/mobile';
    if (!fs.existsSync(mobileDir)) {
        fs.mkdirSync(mobileDir);
    }
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.emulate(iPhone);

    await page.goto(url);
    await page.waitForTimeout(2000);

    const frames = page.frames();
    const frame = frames.find(frame => frame.url().includes('cmp'));

    let btn;
     
    
    if (frame) {
        await frame.waitForXPath(xpath);
        [btn] = await frame.$x(xpath);
    } else {
        await page.waitForXPath(xpath);
        [btn] = await page.$x(xpath);
    }

    await page.screenshot({ path: mobileDir + '/consent_dialog.png' });

    if (btn) {
        await page.setRequestInterception(true);
        await btn.click();
        page.on('request', async (request) => {
            if (request.method() === 'GET') {
                await fsp.appendFile(mobileDir + '/GET_traffic.json', request.method().toString() + ' ' + request.url() + '\n');
            } else if (request.method() === 'POST') {
                await fsp.appendFile(mobileDir + '/POST_traffic.json', request.method().toString() + ' ' + request.url() + '\n');
            }
            request.continue();
        });
    }

    await page.waitForTimeout(8000);

    const cookies = await page.cookies();
    await fsp.appendFile(mobileDir + '/cookies.json', JSON.stringify(cookies, null, 2));

    await browser.close();
};