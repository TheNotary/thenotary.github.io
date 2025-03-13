function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return('');
}

function put_name(fullName) {
    document.getElementById('page-title').textContent = fullName;
}

function put_msg(name) {
    // visitorMsg is depricated, need to clean up loose ends
    let msg = `Hi I'm ${name}, a technologist and dedicated problem solver `;
    msg += "with over <strong>10 years</strong> of industry experience.  ";
    msg += "Give me a shout so we can talk through your business needs and see if my skills can be of service to you.";
    document.getElementById('msg').innerHTML = msg;
}

function putSocial(value) {
    if (value)
        document.getElementById('social').href = value;
}

function putTextContent(id, text) {
    if (text)
        document.getElementById(id).textContent = text;
}


function getAndDecode(param) {
    return decodeURI(getQueryVariable(param));
}

function populatePII(obj, auth_level) {
    switch (auth_level) {
        case "":
            console.log("Undefined auth_level, assuming full... not actually good though");
        case "2":
            console.log("Populating email/ phone");
            // Show the email/ phone div
            document.getElementsByClassName('email-phone')[0].classList.remove('no-render');
            putTextContent('email', obj['e'])
            putTextContent('phone', obj['p'].replace(")", ") "))
        case "1":
            console.log("Populating location");
            putTextContent('city', obj['c']);
            putTextContent('state', obj['s']);
            putSocial(obj['li']);
        case "0":
            console.log("Populating names");
            const name = `${obj['f']} ${obj['l']}`.trim();
            const title = obj['t'];
            put_name(name);
            put_msg(name);
            break;
        default:
            console.log("idk: " + auth_level);
    }
}
