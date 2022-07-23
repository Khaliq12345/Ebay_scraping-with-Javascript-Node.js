
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');

const scrapedData = [];

async function ebay_samsumg_scraper(){

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: './tmp'
    });
    
    const page = await browser.newPage();
    await page.goto('https://www.ebay.com/b/Samsung/bn_21834655?rt=nc&_pgn=1');
    const pageLimit = 50;

    for (index = 1; index < pageLimit; index++ ){
        await page.waitForSelector('.pagination__next.icon-link');
        const pageData = await page.evaluate(() =>{
            return{html: document.documentElement.innerHTML,}
        })

        await scraper(pageData);
        await page.click('.pagination__next.icon-link')
    }
    
    async function scraper(pageData){
        const $ = cheerio.load(pageData.html);
    
        $('.s-item--large').each((index,e) =>{
            const name = $(e).find('h3').text();
            const price = $(e).find('.s-item__price').text();
            const shipping = $(e).find('.s-item__logisticsCost').text();
            const image = $(e).find('.s-item__image-img').attr('src');
            const link = $(e).find('.s-item__link').attr('href');
    
            scrapedData.push({
                'Product':name,
                'Price':price,
                'Shipping':shipping,
                'Product image':image,
                'Product link':link
            })
    
        });

    }
    const csv = json2csv.parse(scrapedData);
    fs.writeFileSync('ebay_samsumg.csv', csv);
    console.log(scrapedData);

    await browser.close();
}

ebay_samsumg_scraper();