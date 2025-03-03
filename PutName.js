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

function putName(fullName) {
    document.getElementById('real_name').textContent = fullName;
}

function putMsg(name, title) {
    const visitorMsg = "Hi! Based on the link you used to reach this page, you must be idly dropping by for fun.  I hope you enjoy your visit."
    const authorizedMsg = `Hi, I'm ${name}, a ${title} and avid problem solver with over 10 years of industry experience.  Give me a shout so we can talk over your business needs and develop the solution that best fits your needs.`;
    const msg = name ? authorizedMsg : visitorMsg;
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


const first_name = getAndDecode("f");
const last_name = getAndDecode("l");
const title = getAndDecode("t") || "technologist";

const phone = getAndDecode("p").replace(")", ") ");
const city = getAndDecode("c");
const state = getAndDecode("s");
const email = getAndDecode("e");

if (first_name && first_name.length > 3 && last_name.length > 3) {
    const name = `${first_name} ${last_name}`.trim()
    putName(name);
    putMsg(name, title);
}


put_phone(phone);
put_city(city);
put_state(state);
put_email(email);
