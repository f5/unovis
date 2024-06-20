const BACKSTOP_TEST_CSS_OVERRIDE = `
html {
  background-image: none;
  -webkit-font-smoothing: none !important;
  --font-render-hinting: none;

::-webkit-scrollbar {
  display: none; /* Chrome Safari */
  -ms-overflow-style: none; /* IE 10+ */
  scrollbar-width: none; /* Firefox */
}}`;

module.exports = async (page, scenario) => {
  // inject arbitrary css to override styles
  await page.evaluate(`window._styleData = '${BACKSTOP_TEST_CSS_OVERRIDE}'`);
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    const styleNode = document.createTextNode(window._styleData);
    style.appendChild(styleNode);
    document.head.appendChild(style);
    document.getElementsByTagName('body')[0].style['-webkit-font-smoothing'] = 'none';
  });

  console.log('BACKSTOP_TEST_CSS_OVERRIDE injected for: ' + scenario.label);
};
