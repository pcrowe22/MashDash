const assert = require('assert');
const scrollToElement = require('scroll-to-element');

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

driver.manage().window().maximize();
driver.get('http://127.0.0.1:8888').then(function(){


  driver.getTitle().then(function(actualTitle) { 
      var targetTitle = 'MashDash';
      assert.equal(actualTitle, targetTitle);
      console.log("Title correct");
  });

  //test login
  driver.findElement(webdriver.By.id("login-link"))
    .then(function(btn){
        return btn.click();
    }).then(function() {
        return driver.findElement(webdriver.By.id("login-username"));
    }).then(function(input){
        return input.sendKeys("lithoriv@gmail.com");
    }).then(function() {
        return driver.findElement(webdriver.By.id("login-password"));
    }).then(function(input){
        return input.sendKeys("MashDash");
    }).then(function() {
        return driver.findElement(webdriver.By.id("login-button"));
    }).then(function(button){
        return button.click();
    })
    
    //test artist search
    .then(function() {
        var firstArtist = "Foo Fighters";

        console.log("Logged In");

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
        .then((input) => {
            console.log("Searching artist");
            return input.click()})
        .then(() => driver.findElement(webdriver.By.id("get-recommendation")))
        .then((button) => button.click())

        .then(() => driver.wait(until.elementLocated(By.id('track0'))))
        .then(() => driver.wait(until.elementIsVisible(driver.findElement(By.id('track0')))))

        .then(() => driver.findElement(By.id('track0')))
        .then((actualTrack) => assert(actualTrack, "Track does not exist"))

        // Script for when button needs to be scrolled to
        /*.then(() => driver.findElement(By.name(firstArtist)))
        .then((element) => driver.executeScript("arguments[0].scrollIntoView(true);", element))
        .then(() => driver.sleep(1000))*/

        .then(() => driver.findElement(By.name(firstArtist)))
        .then((input) => input.click())
        
        // genre test
        .then(() => driver.findElements(By.name('genre-checkbox')))
        .then((inputs) => {
            console.log("Genre test");
            return inputs[0].click();
        })

        .then(() => driver.wait(until.elementLocated(By.id('track0'))))
        .then(() => driver.wait(until.elementIsVisible(driver.findElement(By.id('track0')))))

        .then(() => driver.findElement(By.id('track0')))
        .then((actualTrack) => assert(actualTrack, "Track does not exist"))

        // Test passed, quit driver
        .then(() => {
            console.log("Test Successful!");
            return driver.quit();
        });
  });                       
});
