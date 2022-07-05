const assert = require('assert');

const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

// Enables headless mode, which is necessary for server environment where no GUI exists
const chrome = require('selenium-webdriver/chrome');
let opts = new chrome.Options();
opts.headless();

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(opts)
    .build();
driver.get('localhost:8888').then(function(){
/*driver.findElement(webdriver.By.name('q')).sendKeys('webdriver\n').then(function(){
    driver.getTitle().then(function(title) {
      console.log(title)
      if(title === 'webdriver - Google Search') {
         console.log('Test passed');
      } else {
         console.log('Test failed');
      }
     driver.quit();
    });
  });*/
    var actualTitle = driver.getTitle();
    var targetTitle = 'MashDash';
    assert.equal(actualTitle, targetTitle);
});