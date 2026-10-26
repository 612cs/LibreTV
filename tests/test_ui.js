const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 950 } });
  const page = await context.newPage();

  console.log("1. 正在访问首页...");
  await page.goto("https://libretv-dusky-seven.vercel.app", { waitUntil: "networkidle" });

  const pwdInput = page.locator('input[type="password"]');
  if (await pwdInput.count() > 0) {
    console.log("输入密码登录...");
    await pwdInput.fill("libretv612");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
  }

  console.log("截图首页 4K 横屏 Hero...");
  await page.screenshot({ path: "/Users/chensheng/Projects/LibreTV/tests/tab-home-v2.png" });

  console.log("点击【电影】Tab...");
  await page.locator('nav button:has-text("电影")').click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/Users/chensheng/Projects/LibreTV/tests/tab-movie-v2.png" });

  console.log("点击【动漫】Tab...");
  await page.locator('nav button:has-text("动漫")').click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "/Users/chensheng/Projects/LibreTV/tests/tab-anime-v2.png" });

  console.log("验收截图全部完成！");
  await browser.close();
})();
