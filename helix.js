// Helix State
let enabled = true;
let offset = 0;
let slowAt = 13;

// Draw Word State
const words = [ "Ruby", "Py", "Go", "JS", "Rails", "CI", "k8s", "C++", "TS", "Java", "C#" ];
let textEdge = true;
let wordIndex = 0;

let overlappers = [];

function drawHelix(ctx, config) {
    // Decelerate when we hit the break point
    if (offset > slowAt) {
        config.speed -= 0.0001;
    }

    // stop when we're going reverse long enough to feel cool :)
    if (offset > slowAt && config.speed <= 0) {
        return;
    }

    ctx.clearRect(0, 0, config.width, config.height);

    // 1. Draw all connection rungs first so subsequent objects are drawn on top
    forEachPhaseIncrement( (y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        let [shortLDotX, shortRStrandX] = getRungEndPoints(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand);

        drawConnectingRungs(y, shortRStrandX, shortLDotX);
    });

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

    // 2. Draw all of the background amino acids
    forEachPhaseIncrement((y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        const leftStrandIsCloser = scaleLeftDot > scaleRightStrand;
        if (leftStrandIsCloser) {
            drawSolidRightStrand(y, rStrandX, scaleRightStrand);
        } else {
            drawDottedLeftStrand(y, lDotX, scaleLeftDot);
        }
    });

    function getAminoAcidIndex(y, offset) {
        return Math.floor( (y + offset) / config.strands.left.spacing );
    }

    // 3. Draw the remaining, foreground amino acids
    forEachPhaseIncrement((y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        const leftStrandIsCloser = scaleLeftDot > scaleRightStrand;
        if (leftStrandIsCloser) {
            drawDottedLeftStrand(y, lDotX, scaleLeftDot);

            //////////////////////////
            // HandDrawingLettering //
            //////////////////////////
            let [shortLDotX, shortRStrandX] = getRungEndPoints(y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand);
            const acidIndex = getAminoAcidIndex(y, offset);

            // at offset 0, we adjust our target region by nothing
            // at offset 1, we adjust our target region by bound - f(offset) where f(offset) is
            // const targetRegionOffset = (offset / config.speed) % (config.height - 300);
            const targetRegionOffset = (offset * 30) % (config.height);
            const lowerBound = config.height - targetRegionOffset - 300;
            const upperBound = config.height - targetRegionOffset;
            // TODO: Make this target region wander with time (offset)
            // it should flow up the y axis, so decreasing lower and upper bounds
            // but it must reset using a modulus function
            const isInTargetRegion = (lowerBound < y && y < upperBound);
            const isOverlappedAminoAcid = shortLDotX == 0;

            if (isOverlappedAminoAcid && isInTargetRegion) {
                if (y % 30 == 0) {
                    drawWord(y, lDotX, words[acidIndex % words.length]);
                }
            }
        } else {
            drawSolidRightStrand(y, rStrandX, scaleRightStrand);
        }
    });

    function forEachPhaseIncrement(cb) {
        const centerX = config.width / 2;
        const startY = -10;
        const endY = config.height + 10;

        for (let y = startY; y <= endY; y += 1) {
            const phase = y * config.frequency + offset;

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

    // Draw the connecting rungs between strands at intervals
    function drawConnectingRungs(y, rStrandX, lDotX) {
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
        if (y % 2 === 0) {
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
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillText(word, lDotX + offsetX, y + offsetY);
    }

    if (config.loop) {
        offset += config.speed;
        if (enabled)
            requestAnimationFrame( () => { drawHelix(ctx, config) } );
    }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove the # if present
    hex = hex.replace(/^#/, '');

    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
}

const cWidth = 180;
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

// Allow user to disable and hide helix
helixContainer.onclick = () => {
    // enabled = !enabled
    if (enabled) {
        // Disable
        canvas.classList.add('hidden');
        canvas.classList.remove('hideable');
        setTimeout(() => {
            enabled = !enabled;
        }, 2000);
    } else {
        // Enable
        canvas.classList.add('hideable');
        canvas.classList.remove('hidden');
        enabled = !enabled;
        drawHelix(ctx, config, 9);
    }
}

const config = {
    loop: true,
    // Customize the helix/ sine wave here
    amplitude: 50,
    frequency: 0.02,
    // speed: 0.005,  // best speed...
    speed: 0.02,
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


const debugSlider = document.getElementById("slider");
    if (debugSlider) {

    debugSlider.oninput = (e) => {
        offset = e.target.value * 0.1;

        drawHelix(ctx, config);
    }
}


drawHelix(ctx, config);
