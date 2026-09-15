const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/build/html/smoosic.html", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: "C:/Users/ignas/AppData/Local/Temp/verify_01_initial.png" });

  const btnVisible = await page.isVisible("#bg-selector-btn");
  console.log("Button visible:", btnVisible);

  const dropdownOpen = await page.evaluate(() => document.getElementById("bg-dropdown").classList.contains("open"));
  console.log("Dropdown open initially:", dropdownOpen);

  await page.click("#bg-selector-btn");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "C:/Users/ignas/AppData/Local/Temp/verify_02_dropdown_open.png" });
  const dropdownOpenAfter = await page.evaluate(() => document.getElementById("bg-dropdown").classList.contains("open"));
  console.log("Dropdown open after click:", dropdownOpenAfter);

  const optionTexts = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".bg-option")).map(o => o.textContent.trim())
  );
  console.log("Options:", JSON.stringify(optionTexts));

  await page.click('[data-bg="../uploads/beach.gif"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: "C:/Users/ignas/AppData/Local/Temp/verify_03_beach.png" });
  const bgActive = await page.evaluate(() => {
    const el = document.getElementById("bg-gif-layer");
    return { active: el.classList.contains("active"), bg: el.style.backgroundImage };
  });
  console.log("After beach select:", JSON.stringify(bgActive));

  await page.click("#bg-selector-btn");
  await page.waitForTimeout(300);
  await page.click('[data-bg="../uploads/desert.gif"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: "C:/Users/ignas/AppData/Local/Temp/verify_04_desert.png" });
  const bgDesert = await page.evaluate(() => {
    const el = document.getElementById("bg-gif-layer");
    return { active: el.classList.contains("active"), bg: el.style.backgroundImage };
  });
  console.log("After desert select:", JSON.stringify(bgDesert));

  // Probe: outside click closes dropdown
  await page.click("#bg-selector-btn");
  await page.waitForTimeout(200);
  await page.click("body", { position: { x: 100, y: 100 } });
  await page.waitForTimeout(300);
  const dropdownClosedResult = await page.evaluate(() => !document.getElementById("bg-dropdown").classList.contains("open"));
  console.log("Dropdown closes on outside click:", dropdownClosedResult);

  // Probe: Be fono resets background
  await page.click("#bg-selector-btn");
  await page.waitForTimeout(200);
  await page.click('[data-bg="none"]');
  await page.waitForTimeout(600);
  const bgNone = await page.evaluate(() => {
    const el = document.getElementById("bg-gif-layer");
    return { active: el.classList.contains("active"), bg: el.style.backgroundImage };
  });
  console.log("After none select:", JSON.stringify(bgNone));
  await page.screenshot({ path: "C:/Users/ignas/AppData/Local/Temp/verify_05_none.png" });

  await browser.close();
  console.log("DONE");
})();
