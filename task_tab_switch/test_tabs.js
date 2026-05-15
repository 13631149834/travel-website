const { chromium } = require('puppeteer');

async function testPage(page, url) {
    console.log(`\n=== Testing ${url} ===`);
    await page.goto(`file://${process.cwd()}/${url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // 检查Tab按钮
    const tabBtns = await page.$$('.tab-btn');
    console.log(`Tab buttons found: ${tabBtns.length}`);
    
    // 检查back-to-top按钮
    const backToTop = await page.$('.back-to-top');
    console.log(`Back to top button: ${backToTop ? 'Found' : 'Not found'}`);
    
    // 测试点击第一个Tab
    if (tabBtns.length > 1) {
        await tabBtns[1].click();
        await page.waitForTimeout(300);
        const isVisible = await page.$eval('#tab-memory, #tab-destinations, #tab-law', el => {
            return window.getComputedStyle(el).display !== 'none';
        });
        console.log(`Tab switching works: ${isVisible}`);
    }
    
    // 截图
    await page.screenshot({ path: `task_tab_switch/screenshot_${url.replace('.html', '')}.png`, fullPage: false });
    console.log(`Screenshot saved`);
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    
    await testPage(page, 'free-materials.html');
    await testPage(page, 'travel-knowledge.html');
    
    await browser.close();
    console.log('\n=== All tests completed ===');
})();
