const assert = require('assert');

const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

// Enables headless mode, which is necessary for server environment where no GUI exists
const chrome = require('selenium-webdriver/chrome');
let opts = new chrome.Options();
opts.headless();
opts.addArguments('window-size=1920x1080');

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(opts)
    .build();
driver.get('http://127.0.0.1:8888').then(function(){
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

  /*return driver.getCurrentUrl();
  }).then(function(currentUrl) {
        console.log(currentUrl);
  });*/
    
  driver.getTitle().then(function(actualTitle) { 
      console.log("Title: " + actualTitle);
      var targetTitle = 'MashDash';
      assert.equal(actualTitle, targetTitle);
  });

  driver.findElement(webdriver.By.id("login")).then(function(){
    driver.quit();
  });
    
    
});