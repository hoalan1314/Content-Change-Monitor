const config = require('./config.json');
const axios = require('axios');
const discord = require('./discord');
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "content-monitor"});

(async () => {
  const cache = {}
  const websites = config.websites
  log.info(`init...`);
  for (const website of websites) {
    log.info(`Running ${website.name} now...`);
    const cron = require('node-cron');
    const cheerio = require('cheerio');
    cron.schedule(website.cron, async () => {
      log.info(`Running ${website.name} cron now...`);
      try {
        const response = await axios.get(website.url, {
          "headers": {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-GB,en;q=0.9',
            'cache-control': 'no-cache',
            pragma: 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
          },
          responseType: 'text',
          responseEncoding: "utf-8",
          transformResponse: undefined
        })
        const $ = cheerio.load(response.data)
        const html = $(website.selector).html()
        if(html !== cache[website.name]) {
          cache[website.name] = html
          discord(config.discordWebhook, website.name, website.url, 'Content changed')
        }
        log.info(`Running ${website.name} success`);
      } catch (e) {
        try {
          log.error(`Running ${website.name} fail`, e.message)
          discord(config.discordWebhook, website.name, website.url, `Fetch fail: ${e.message}`, true)
        } catch (e) {
          log.error(`Discord error`, e.message)
        }
      }
    });
  }
})()
