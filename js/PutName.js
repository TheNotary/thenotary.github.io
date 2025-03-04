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

// TODO: the grammer breaks if the title begins with a vowel... don't let it end this way
function put_msg(name, title) {
    // visitorMsg is depricated, need to clean up loose ends
    const authorizedMsg = `Hi, I'm ${name}, a technologist and dedicated problem solver with over 10 years of industry experience.  Give me a shout so we can talk over your business needs and develop the solution that fits best.`;
    document.getElementById('msg').textContent = authorizedMsg;
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
    const name = `${obj['f']} ${obj['l']}`.trim()
    const title = obj['t'];
    put_name(name);

    put_msg(name, title);

    put_phone(obj['p'].replace(")", ") "));
    put_city(obj['c']);
    put_state(obj['s']);
    put_email(obj['e']);
}
