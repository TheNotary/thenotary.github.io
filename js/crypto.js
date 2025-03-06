(() => {
    let generateNewKeys = false;

    const auth_level = "2";
    // Payload to encrypt when in `generateNewKeys` mode
    const dataToEncrypt = {
        f: "John",
        l: "Smith",
        c: "New York",
        s: "Ny",
        li: "https://www.linkedin.com/in/john-smith/",
        p: "(555)555-1234",
        e: "john.smith@gmail.com",
    }

    let soupKitchen = {
        "1": { // Social media and name access
            "ciphertext": "gOeKmoolWX+c32psJzP+uGsXWtyeK0ZVBoZKPwPvhzfapTof0+yEUA8j3zOW1sofMtfFz1oXZMuZlQKWAnJFt5PgROHWdlbcmxZmwfavp34kRi3jvy/l6e5KgKaui9EqqMGv7U6uQfHcohPp3iiDbz/gbLYjIG8z0KJ84hQl2/MmumW/xjmqKhHjyIohVI1oKs9RATeOkOk=",
        },
        "2": { // Full access
            "ciphertext": "CanBXy07gDUIvHVG0b9oJgjYdqZQRN+YJ8YDmLX7Q1KVZA+KzewRgbH3FJXX/h6ULagHZp5R5z7mDzf78C/hpYFurpYFGkXNjcUfwKRN5FTRVNd6RZIzdGT6H3/vPCdK0X2f28zg12MhG500/2MMJxAC/AbQAq5m/KnswVZ4Dc4aX6O5pPU/WfyU3O9r8Cxp/XlTUX31k3qlWgQG+qnw7oiwTA=="
        },
    };

    // TODO: Add a develper console that makes encrypting data elegant?
    // Otherwise to spin up new keys, uncomment generateKeyAndPerformEncryption()
    // and copy from the console output.
    if (generateNewKeys) {
        generateKeyAndPerformEncryption();
    } else {
        decodeDataPerUri();
    }

    /*
        Fetch the contents of the "message" textbox, and encode it
        in a form we can use for the encrypt operation.
    */
    function encodeMsg(msg) {
        return (new TextEncoder()).encode(msg);
    }

    /*
        Generate a counter (badly apparently), and use it to encrypt the msg
        with the given key.  Returns the counter and cipher which are both
        needed to perform decryption.
    */
    async function encryptMessage(key, counter, msg) {
        let encodedMsg = encodeMsg(msg);

        let ciphertext = await window.crypto.subtle.encrypt(
            {
                name: "AES-CTR",
                counter,
                length: 64
            },
            key,
            encodedMsg
        );

        return ciphertext;
    }

    /*
        Fetch the ciphertext and decrypt it.
        Write the decrypted message into the "Decrypted" box.
    */
    async function decryptMessage(key, counter, ciphertext) {
        let decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CTR",
                counter,
                length: 64
            },
            key,
            ciphertext
        );

        return (new TextDecoder()).decode(decrypted);
    }

    /*
        Generate key and encrypt data, used to generate data soup for commiting
        to the repo.
    */
    function generateKeyAndPerformEncryption() {
        window.crypto.subtle.generateKey(
            {
                name: "AES-CTR",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        ).then(async (key) => {
            // export/ import counter to string
            // let counter = window.crypto.getRandomValues(new Uint8Array(16));
            let counter = new Uint8Array(16);
            counter[0] = Number(auth_level);
            let counter_string = arrayBufferToBase64(counter);
            // console.log("generated counter:");
            // console.log(counter_string);
            console.log(`auth_level: ${auth_level}`)

            counter = base64ToArrayBuffer(counter_string);

            // Export the key to a string
            let exp = await window.crypto.subtle.exportKey("jwk", key);
            let key_jwt_string = JSON.stringify(exp)
            console.log("generated crypto key data:");
            console.log(exp['k']);

            let keyJwt = JSON.parse(key_jwt_string);

            key = await window.crypto.subtle.importKey(
                "jwk",
                keyJwt,
                {
                    name: "AES-CTR",
                    length: 256
                },
                true,
                ["encrypt", "decrypt"],
            );

            let msg = JSON.stringify(dataToEncrypt);
            const ciphertext = await encryptMessage(key, counter, msg);
            const base64Ciphertext = arrayBufferToBase64(ciphertext);

            console.log("Ciphertext: ");
            console.log(base64Ciphertext);

            const unbasedCiphertext = base64ToArrayBuffer(base64Ciphertext);

            let decryptedMsg = await decryptMessage(key, counter, unbasedCiphertext);

            let decryptedData = JSON.parse(decryptedMsg);
            if (decryptedData['f'] == dataToEncrypt['f']) {
                console.log("Encryption/ Decryption worked!");
                console.log(`first_name: ${decryptedData['f']}`);
                console.log("");
                console.log(`link:  ?key=${exp['k']}&lvl=${auth_level}`);
            } else {
                console.log("Encryption/ Decryption failed!");
            }
        });
    }


    async function decodeDataPerUri() {
        const key_data_string = getQueryVariable('key');
        if (key_data_string == "") {
            console.log("missing key");
            let contactDiv = document.getElementById('contact')
            let centerDiv = contactDiv.children[0];
            let msg = "";
            msg += "AES Key Missing <br/><br/>"
            msg += "My contact information is encrypted via the Web Crypto API.  ";
            msg += "If you were linked here directly, I meant to include the decryption key in the link I gave you.  ";
            msg += "Double check that nothing's gone wrong with the URI.";
            msg += "<br/><br/>";
            msg += "Otherwise if you're here through sheer meandering, thanks for stopping by :)";
            centerDiv.innerHTML = msg;
            return;
        }

        let auth_level = getQueryVariable('lvl') == "" ? "2" : getQueryVariable('lvl');

        // const counter_string = soupKitchen[auth_level]["counter"];
        const ciphertextString = soupKitchen[auth_level]["ciphertext"];

        let keyJwt = {"alg":"A256CTR","ext":true,"key_ops":["encrypt","decrypt"],"kty":"oct"};
        keyJwt = { ...keyJwt, ...{ "k": key_data_string } };

        // let counter = base64ToArrayBuffer(counter_string);
        // I don't actually get value from sending the counter along with the key...
        // I want to have 1 encrypted payload that is decrypted by any of two keys
        // and depending on which key, more or less information is revealed
        // where the constraints are
        // 1. How well the decryption keys can fit in the address bar
        // 2. How long it takes the JS to complete the decryption
        // Since I'm halfway through this refactor, I'm going to commit to it,
        // but I think what I want a variation on AES-CTR, where there's a
        // cryptographically secure way to start decryption in the middle of the
        // chain while having no way of decrypting the prior message without
        // a "stronger" key... It's like HIBE, but not really...
        // Wait, AES-CTR should be useable but I need to make the counter block
        // non-incremental... I'd have to read up on how long it takes to decrypt
        // AES-CTR given the key, ciphertext, but not the counter.  Is that 128bits vs 256?
        // I wonder if I can bump the counter up to 256 without too much effort...
        let counter = new Uint8Array(16);
        counter[0] = Number(auth_level);

        let ciphertext = base64ToArrayBuffer(ciphertextString);

        try {
            var key = await window.crypto.subtle.importKey(
                "jwk",
                keyJwt,
                {
                    name: "AES-CTR",
                    length: 256
                },
                true,
                ["encrypt", "decrypt"],
            );
        }
        catch (e) {
            console.log("Error: Bad Key, skipping decrypt.");
            return;
        }

        let decryptedMsg = await decryptMessage(key, counter, ciphertext);
        let obj = JSON.parse(decryptedMsg);

        console.log("Decrypted: " + obj['f']);
        populatePII(obj, auth_level);
    }

    function xorBuffers(buf1, buf2) {
        const result = new Uint8Array(buf1.length);
        for (let i = 0; i < buf1.length; i++) {
            result[i] = buf1[i] ^ buf2[i];
        }
        return result;
    }

    function arrayBufferToBase64(arrayBuffer) {
        return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    }

    function base64ToArrayBuffer(base64String) {
        return new Uint8Array(
            atob(base64String)
                .split("")
                .map(char => char.charCodeAt(0))
        );
    }

    function getAndDecode(param) {
        return decodeURI(getQueryVariable(param));
    }

})();
