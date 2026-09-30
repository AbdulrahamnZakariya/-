const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('err:', e.message));
  await p.goto('file://' + process.cwd() + '/scene.html'); await p.evaluate(() => window.ready);
  const total = await p.evaluate(() => window.TOTAL), fps = 30, n = Math.round(total * fps);
  for (let f = +(process.argv[2] || 0); f < n; f++) {
    await p.evaluate(t => renderAt(t), f / fps);
    await p.screenshot({ path: `frames/f_${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    if (f % 200 === 0) console.log('frame', f, '/', n);
  }
  await b.close(); console.log('done');
})();
