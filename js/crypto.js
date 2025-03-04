(() => {
    /*
        Fetch the contents of the "message" textbox, and encode it
        in a form we can use for the encrypt operation.
    */
    function encodeMsg(msg) {
        return (new TextEncoder()).encode(msg);
    }

    /*
        Generate a counter (badly apparently), and use it to encrypt the msg
        with the given key.  Returns the counter and cypher which are both
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
            let counter = window.crypto.getRandomValues(new Uint8Array(16));
            let counter_string = arrayBufferToBase64(counter);
            console.log("generated counter:");
            console.log(counter_string);
            counter = base64ToArrayBuffer(counter_string);

            // Export the key to a string
            let exp = await window.crypto.subtle.exportKey("jwk", key);
            let key_jwt_string = JSON.stringify(exp)
            console.log("generated crypto key data:");
            console.log(exp['k']);

            let key_jwt = JSON.parse(key_jwt_string);

            key = await window.crypto.subtle.importKey(
                "jwk",
                key_jwt,
                {
                    name: "AES-CTR",
                    length: 256
                },
                true,
                ["encrypt", "decrypt"],
            );

            // Encrypt some payload
            let data = {
                f: "John",
                l: "Smith",
                c: "New York",
                s: "NY",
                p: "(555)555-1234",
                e: "John@example.com",
                t: "Typist",
            }

            let msg = JSON.stringify(data);
            const cyphertext = await encryptMessage(key, counter, msg);
            const base64Cyphertext = arrayBufferToBase64(cyphertext);

            console.log("Cyphertext: ");
            console.log(base64Cyphertext);

            const unbasedCyphertext = base64ToArrayBuffer(base64Cyphertext);

            let decryptedMsg = await decryptMessage(key, counter, unbasedCyphertext);

            let obj = JSON.parse(decryptedMsg);
            console.log("Decrypted: " + obj['f']);
        });
    }

    //generateKeyAndPerformEncryption();

    DecodeDataSoup();

    async function DecodeDataSoup() {
        const key_data_string = getQueryVariable('key');
        if (key_data_string == "") {
            console.log("missing key");
            let contactDiv = document.getElementById('contact')
            let centerDiv = contactDiv.children[0];
            centerDiv.innerHTML = "AES Key Missing <br/><br/>  My contact information is encrypted via the Web Crypto API.  If you were linked here directly, I meant to include the decryption key in the link I gave you.  Double check that nothing's gone wrong with the URI. <br/><br/>  Otherwise if you're here through sheer meandering, thanks for stopping by :)";
            return;
        }

        // let key_data_string = ""
        let counter_string = "Zkpj7JQ1Yf6oTJjk3m598A=="
        let cyphertextString = "m4W9k5Cv1tir8eHapsxmLXZchswL4l/ammHxHrmcBSqPZ4vZ3f2ZPgwCQM2O6snhrZSImi3ShqEw/9YV/iN2QOsIpejfGjlRIM24i9nhWiqVVmmGMzKQ7VbifVHLkPeKgfyAnVCxctGhbhTDHWfZ7UO/C3fGCLBj4mfQHLs=";

        let key_jwt = { "k": key_data_string, "alg":"A256CTR","ext":true,"key_ops":["encrypt","decrypt"],"kty":"oct"};
        let counter = base64ToArrayBuffer(counter_string);
        let cyphertext = base64ToArrayBuffer(cyphertextString);

        const key = await window.crypto.subtle.importKey(
            "jwk",
            key_jwt,
            {
                name: "AES-CTR",
                length: 256
            },
            true,
            ["encrypt", "decrypt"],
        );

        let decryptedMsg = await decryptMessage(key, counter, cyphertext);
        let obj = JSON.parse(decryptedMsg);

        console.log("Decrypted: " + obj['f']);
        populatePII(obj);
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
