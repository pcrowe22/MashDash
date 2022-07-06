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
driver.get('http://127.0.0.1:8888').then(function(){


  driver.getTitle().then(function(actualTitle) { 
      console.log("Title: " + actualTitle);
      var targetTitle = 'MashDash';
      assert.equal(actualTitle, targetTitle);
  });

  //test login
  driver.findElement(webdriver.By.id("login-link"))
    .then(function(btn){
        return btn.click();
    }).then(function() {
        return driver.findElement(webdriver.By.id("login-username"));
    }).then(function(input){
        return input.sendKeys("pcrowe.piano@gmail.com");
    }).then(function() {
        return driver.findElement(webdriver.By.id("login-password"));
    }).then(function(input){
        return input.sendKeys("Megalithic1");
    }).then(function() {
        return driver.findElement(webdriver.By.id("login-button"));
    }).then(function(button){
        return button.click();
    })
    
    //test artist search
    .then(function() {
        var firstArtist = "Foo Fighters";

        // wait for elements to load
        driver.wait(until.elementLocated(By.id("artist-input")))
        .then(() => driver.wait(until.elementIsVisible(driver.findElement(By.id('artist-input')))))

        .then(() => driver.findElement(By.id('artist-input')))
        .then((input) => input.sendKeys(firstArtist))
        .then(() => driver.findElement(webdriver.By.id("search-artists")))
        .then((button) => button.click())

        .then(() => driver.wait(until.elementLocated(By.name(firstArtist))))
        .then(() => driver.wait(until.elementIsVisible(driver.findElement(By.name(firstArtist)))))

        .then(() => driver.findElement(webdriver.By.name(firstArtist)))
        .then((input) => input.click())
        .then(() => driver.findElement(webdriver.By.id("get-recommendation")))
        .then((button) => button.click())

        .then(() => driver.wait(until.elementLocated(By.id('track0'))))
        .then(() => driver.wait(until.elementIsVisible(driver.findElement(By.id('track0')))))

        .then(() => driver.findElement(By.id('track0'))
        .then((actualTrack) => {
            
            assert(actualTrack, "Track does not exist");
            return;
        }).then(() => {
            console.log("Test Successful!");
            return driver.quit();
        }));
    });
    
                         
})