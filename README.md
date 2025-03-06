# Readme

Example Referral: https://thenotary.github.io/index.html?key=VALID_AES_KEY&lvl=2



## Populated Encrypted Data

PII Data is encrypted at two levels.  The encrypted data is at the top of the crypto.js file.  Flipping the configuration `generateNewKeys` to true and loading the page will invoke the function that generates new keys and encrypts the 

TODO:  
- The new crypto feature re-introduced some mild page bounce easily resolved by..... well it's the title.... I guess I could animate from a masked out "******" value to the real header.
- There's page bounce in the contact div too.  
- And page bounce in the introduction... every piece of content save for the labels subtitle is now dynamic
