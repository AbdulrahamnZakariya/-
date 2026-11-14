const { chromium } = require('playwright');
(async () => {
  const [a, b] = [+process.argv[2], +process.argv[3]];
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('err:', e.message));
  await p.goto('file://' + process.cwd() + '/scene.html'); await p.evaluate(() => window.ready);
  for (let f = a; f < b; f++) {
    await p.evaluate(t => renderAt(t), f / 30);
    await p.screenshot({ path: `frames/f_${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await br.close(); console.log('done', a, b);
})();
