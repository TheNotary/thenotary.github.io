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

function putMsg() {
    const msg = "I see that you came here via my referal link.  Thanks for stopping by to examine my work, I genuinely appreciate your taking the time.  I hope you enjoy your peruse andn everything finds you well."
    document.getElementById('msg').textContent = msg;
}

const first_name = getQueryVariable("first_name");
const last_name = getQueryVariable("last_name");

if (first_name) {
    putName(`${first_name} ${last_name}`);
    putMsg();
}
