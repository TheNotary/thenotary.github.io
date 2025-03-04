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


/////////////////////////
// Hook the Scroll Bar //
/////////////////////////

const scrollEvents = []

scrollEvents.push(forwardScrollEventToHelix);
scrollEvents.push(startFadeInEarly);

document.addEventListener("scroll", (event) => {
    // startFadeInEarly();
    // forwardScrollEventToHelix();

    for (const evt of scrollEvents) {
        evt();
    }
});





function forwardScrollEventToHelix() {
    // This global is defined in helix.js..... I should probably make a Helix
    // class at this point
    scrollPosition = window.scrollY;

    if (!enabled) {
        if (config.speed = 0) {
            config.speed = 0.02;
        }
        drawHelix(ctx, config);
    }
}


const myWork = document.getElementById('my-work');
let anim = myWork.getAnimations()[0];

function startFadeInEarly() {
    console.log("zzz");

    const msSinceLoad = performance.now();

    // if (myWork.getAnimations()[0].overallProgress < 0.5 || anim.overallprogress === undefined) {
    // The fade in effect will naturally begin at 4.5seconds into the page load,
    // so don't attempt to speed up the process after that time or you'll see annoying artifacting
    if (msSinceLoad < 4500) {
        // console.log("msSinceLoad: " + msSinceLoad);

        anim.cancel();
        // anim.play()
        myWork.classList.remove('delayed-fade-in')
        void myWork.offsetWidth;
        myWork.classList.add('immediate-fade-in')
        void myWork.offsetWidth;

    }
    scrollEvents.pop();
}
