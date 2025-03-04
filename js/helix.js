// will disable looping and show the slider that controls the time for the helix
let debugWithSlider = false;
let scrollPosition = 0;

// Helix State
let enabled = true;
let time = 0;
let slowAt = 13;

// Draw Word State
const words = [ "Py", "Ruby","Go", "JS", "Rails", "CI", "k8s", "C++", "TS",
                "Java", "C#", "Bash", "AWS", "GCP" ];
let textEdge = true;
let wordIndex = 0;

let overlappers = [];

// Algo Summary
// We draw in 3 passes to ensure that objects 'closer' to the camera are
// correctly overlapping objects 'behind' the camera.
// A pass is performed via the forEachYCrossOfTheCanvas measure which accepts
// a block containing the operations to run at each y cross section.
// After each draw takes place, we call requestAnimationFrame to recursively
// call this function and increment time.
function drawHelix(ctx, config) {
    ctx.clearRect(0, 0, config.width, config.height);

    // Decelerate when we hit the break point
    if (time > slowAt) {
        config.speed -= 0.0001;
    }

    // 1. Draw all connection rungs first so subsequent objects are drawn on top
    forEachYCrossOfTheCanvas( (y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        let [shortLDotX, shortRStrandX] = getRungEndPoints(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand);

        drawConnectingRung(y, shortRStrandX, shortLDotX);
    });

    // 2. Draw all of the background amino acids
    forEachYCrossOfTheCanvas((y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        const leftStrandIsCloser = scaleLeftDot > scaleRightStrand;
        if (leftStrandIsCloser) {
            drawSolidRightStrand(y, rStrandX, scaleRightStrand);
        } else {
            drawDottedLeftStrand(y, lDotX, scaleLeftDot);
        }
    });

    // 3. Draw the remaining, foreground amino acids
    forEachYCrossOfTheCanvas((y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        const leftStrandIsCloser = scaleLeftDot > scaleRightStrand;
        if (leftStrandIsCloser) {
            drawDottedLeftStrand(y, lDotX, scaleLeftDot);

            handleDrawingWords(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand);
        } else {
            drawSolidRightStrand(y, rStrandX, scaleRightStrand);
        }
    });

    // stop when we're going reverse long enough to feel cool :)
    if (time > slowAt && config.speed <= 0) {
        config.speed = 0;
        enabled = false;
    }

    // Recurse
    if (config.loop && !debugWithSlider && enabled) {
        time += config.speed;
        requestAnimationFrame( () => { drawHelix(ctx, config) } );
    }


    // Private Functions ///////////////////////////

    function forEachYCrossOfTheCanvas(cb) {
        const centerX = config.width / 2;
        const startY = -10;
        const endY = config.height + 10;

        for (let y = startY; y <= endY; y += 1) {
            const phase = y * config.frequency + time + (scrollPosition * 0.01);

            // Right strand X value (solid wave)
            const rStrandX = centerX + Math.sin(phase) * config.amplitude;

            // Left dot X Value (dotted amino acids, opposite phase)
            const lDotX = centerX + Math.sin(phase + Math.PI) * config.amplitude;

            const minSize = 2.5;
            const scaleLeftDot     = (minSize + (-1 * Math.cos(phase)) )  * 0.7;  // smallest at 0
            const scaleRightStrand = (minSize + ( 1 * Math.cos(phase)) )  * 0.7;  // largest at 0

            cb(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand);
        }
    }

    function getRungEndPoints(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) {
        let shortLDotX, shortRStrandX;
        const rStrandRadius = config.strands.right.radius;
        const lDotRadius = config.strands.left.radius;

        // lDotX refers to the point where the connectingLine reaches the dotted amino acid (starting on the left)
        if (lDotX < rStrandX) {
            shortLDotX = lDotX + rStrandRadius * scaleLeftDot;
            shortRStrandX = rStrandX - lDotRadius * scaleRightStrand;

            // If our circles are overlapped, don't draw the connecting line!
            if (shortRStrandX < shortLDotX) {
                shortRStrandX = 0;
                shortLDotX = 0;
            }
        } else {
            shortLDotX = lDotX - rStrandRadius * scaleLeftDot;
            shortRStrandX = rStrandX + lDotRadius * scaleRightStrand;

            // If our circles are overlapped, don't draw the connecting line!
            if (shortLDotX < shortRStrandX) {
                shortRStrandX = 0;
                shortLDotX = 0;
            }
        }
        return [shortRStrandX, shortLDotX];
    }

    function getAminoAcidIndex(y, time) {
        return Math.floor( (y + time) / config.strands.left.spacing );
    }

    // Draw the connecting rungs between strands at intervals
    function drawConnectingRung(y, rStrandX, lDotX) {
        if (y % config.strands.left.spacing === 0) {
            ctx.beginPath();
            ctx.moveTo(rStrandX, y);
            ctx.lineTo(lDotX, y);
            ctx.strokeStyle = config.rungs.color;
            ctx.lineWidth = config.rungs.width;
            ctx.stroke();
        }
    }

    function drawSolidRightStrand(y, rStrandX, scaleRightStrand) {
        if (y % 3 === 0) {
            ctx.beginPath();
            ctx.arc(rStrandX, y, config.strands.right.radius * scaleRightStrand, 0, Math.PI * 2);
            ctx.strokeStyle = config.strands.right.stroke_color;
            ctx.lineWidth = 4;
            ctx.fillStyle = config.strands.right.fill_color;
            // ctx.fill();
            ctx.stroke();
        }
    }

    function drawDottedLeftStrand(y, lDotX, scaleLeftDot, color) {
        if (y % config.strands.left.spacing === 0) {
            ctx.beginPath();
            ctx.arc(lDotX, y, config.strands.left.radius * scaleLeftDot, 0, Math.PI * 2);
            ctx.strokeStyle = config.strands.right.stroke_color;
            ctx.fillStyle = color || config.strands.left.fill_color;
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }
    }

    // TODO: I'm not convinced of the correctness of this function
    function handleDrawingWords(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) {
        let [shortLDotX, shortRStrandX] = getRungEndPoints(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand);
        const acidIndex = getAminoAcidIndex(y, time);

        // const targetRegionOffset = (time / config.speed) % (config.height - 300);
        const targetRegionOffset = (time * 30) % (config.height);
        const lowerBound = config.height - targetRegionOffset - 300;
        const upperBound = config.height - targetRegionOffset;
        // TODO: Make this target region wander with time (time)
        // it should flow up the y axis, so decreasing lower and upper bounds
        // but it must reset using a modulus function
        const isInTargetRegion = (lowerBound < y && y < upperBound);
        const isOverlappedAminoAcid = shortLDotX == 0;

        if (isOverlappedAminoAcid && isInTargetRegion) {
            if (y % 30 == 0) {
                drawWord(y, lDotX, words[acidIndex % words.length]);
            }
        }
    }

    function drawWord(y, lDotX, word) {
        let offsetX = -12; // Ruby and Rails work....
        if (word.length == 3) {
            offsetX = -8;
        }
        if (word.length == 2) {
            offsetX = -6;
        }
        const offsetY = 4;
        lDotX = Math.floor(lDotX); // make text less fuzzy

        // Modulate opacity by distance from centerX
        const centerX = config.width / 2;
        const delta = Math.abs(centerX - lDotX);
        const opacity = 1 - (delta / 11);

        ctx.font = "12px serif";
        const color = "66";
        ctx.fillStyle = `rgba(${color}, ${color}, ${color}, ${opacity})`;
        ctx.fillText(word, lDotX + offsetX, y + offsetY);
    }

}


const cWidth = 155;
const cHeight = window.innerHeight;
// On load...
const canvas = document.getElementById('helixCanvas');
const helixContainer = canvas.parentElement;
canvas.width = cWidth;
// canvas.width = 1080;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
  return ctx;
}

setupCanvas(canvas);

// Handle Events /////////////////////

window.addEventListener("resize", (event) => {
    canvas.height = window.innerHeight;
    config.height = window.innerHeight;
    setupCanvas(canvas);
    if (!enabled) {
        drawHelix(ctx, config);
    }
});

document.addEventListener("scroll", (event) => {
    forwardScrollEventToHelix();
});


function forwardScrollEventToHelix() {
    scrollPosition = window.scrollY;

    if (!enabled) {
        if (config.speed = 0) {
            config.speed = 0.02;
        }
        drawHelix(ctx, config);
    }
}


// Allow user to disable and hide helix
helixContainer.onclick = () => {
    const isHidden = canvas.classList.contains('hidden');
    if (isHidden) {
        // Enable
        canvas.classList.add('hideable');
        canvas.classList.remove('hidden');
        // enabled = !enabled;
        // drawHelix(ctx, config, 9);
    } else {
        // Disable
        canvas.classList.add('hidden');
        canvas.classList.remove('hideable');
        // enabled = !enabled;
        // setTimeout(() => {
        //     enabled = !enabled;
        // }, 2000);
    }
}

const config = {
    loop: true,
    // Customize the helix/ sine wave here
    amplitude: 50,
    frequency: 0.02,
    // frequency: 0.02,
    // speed: 0.005,  // best speed...
    speed: 0.02,      // latest best speed
    strands: {
        left: {
            fill_color: '#00adcc',
            radius: 6,
            spacing: 30 // increases space between amino acids
        },
        right: {
            fill_color:   '#33333330',
            stroke_color: '#33333330',
            radius: 6,
        }
    },
    rungs: {
        color: '#33333330',
        width: 4
    },
    width: cWidth,
    height: cHeight,
};

if (debugWithSlider) {
    const debugSlider = document.getElementById("slider");
    debugSlider.classList.remove('no-render');

    debugSlider.oninput = (e) => {
        time = e.target.value * 0.1;

        drawHelix(ctx, config);
    }
}


drawHelix(ctx, config);
