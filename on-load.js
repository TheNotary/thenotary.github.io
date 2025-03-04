// Fix anchor tags that aren't actually anchor tags by spec, but are by ...
// how they're styled the same as anchors, but lack hrefs... idk maybe it should
// be a span or an perhaps an h6, but the structure of the HTML really shouldn't
// change just because I'm not including an HREF with a label...
const subjectsMarkedNoLink = document.getElementsByClassName('no-link');

for (const anchor of subjectsMarkedNoLink) {
    anchor.onclick = function() { return false; };
    anchor.removeAttribute("href");
}

function resetAnimation() {
    const subtitle = document.getElementById('subtitle');
    const contact = document.getElementById('contact');
    subtitle.classList.remove('animate');
    contact.classList.remove('animate');
    void subtitle.offsetWidth;
    void contact.offsetWidth;
    subtitle.classList.add('animate');
    contact.classList.add('animate');
}
