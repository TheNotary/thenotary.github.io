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

const first_name = getQueryVariable("first_name");
const last_name = getQueryVariable("last_name");
const title = getQueryVariable("title") || "technologist";
const phone = getQueryVariable("phone");

if (first_name && first_name.length > 3 && last_name.length > 3) {
    const name = `${first_name} ${last_name}`.trim()
    putName(name);
    putMsg(name, title);
}
