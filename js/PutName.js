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
    document.getElementById('real_name').textContent = fullName;
}

function put_msg(name) {
    // visitorMsg is depricated, need to clean up loose ends
    let msg = `Hi I'm ${name}, a technologist and dedicated problem solver `;
    msg += "with over <strong>10 years</strong> of industry experience.  ";
    msg += "Give me a shout so we can talk through your business needs and see if my skills can be of service to you.";
    document.getElementById('msg').innerHTML = msg;
}

// TODO: Meta programming?
function put_phone(phone) {
    if (phone)
        document.getElementById('phone').textContent = phone;
}

function put_city(city) {
    if (city)
        document.getElementById('city').textContent = city;
}

function put_state(state) {
    if (state)
        document.getElementById('state').textContent = state;
}

function put_email(email) {
    if (email)
        document.getElementById('email').textContent = email;
}

function getAndDecode(param) {
    return decodeURI(getQueryVariable(param));
}

function populatePII(obj) {
    const auth_level = getQueryVariable('lvl');
    switch (auth_level) {
        case "":
            console.log("Undefined, assuming full");
        case "2":
            console.log("Populating email/ phone");
            put_email(obj['e']);
            put_phone(obj['p'].replace(")", ") "));
        case "1":
            console.log("Populating location");
            put_city(obj['c']);
            put_state(obj['s']);
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
