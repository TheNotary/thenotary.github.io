let enabled = true;
let offset = 0;

function drawHelix(ctx, config) {
    ctx.clearRect(0, 0, config.width, config.height);

    // 1. Draw all connection rungs first so subsequent objects are drawn on top
    forEachPhaseIncrement( (y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
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

        drawConnectingRungs(y, shortRStrandX, shortLDotX);
    });

    // 2. Draw all of the background amino acids
    forEachPhaseIncrement((y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        const leftStrandIsCloser = scaleLeftDot > scaleRightStrand;
        if (leftStrandIsCloser) {
            drawSolidRightStrand(y, rStrandX, scaleRightStrand);
        } else {
            drawDottedLeftStrand(y, lDotX, scaleLeftDot);
        }
    });

    // 3. Draw the remaining, foreground amino acids
    forEachPhaseIncrement((y, rStrandX, lDotX, scaleLeftDot, scaleRightStrand) => {
        const leftStrandIsCloser = scaleLeftDot > scaleRightStrand;
        if (leftStrandIsCloser) {
            drawDottedLeftStrand(y, lDotX, scaleLeftDot);
        } else {
            drawSolidRightStrand(y, rStrandX, scaleRightStrand);
        }
    });

    function forEachPhaseIncrement(cb) {
        const centerX = config.width / 2;
        const startY = -10;
        const endY = config.height + 10;
        // const endY = config.height - 10;

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
        ctx.beginPath();
        ctx.arc(rStrandX, y, config.strands.right.radius * scaleRightStrand, 0, Math.PI * 2);
        ctx.strokeStyle = config.strands.right.stroke_color;
        ctx.lineWidth = 2;
        ctx.fillStyle = config.strands.right.fill_color;
        ctx.fill();
        ctx.stroke();
    }

    function drawDottedLeftStrand(y, lDotX, scaleLeftDot) {
        if (y % config.strands.left.spacing === 0) {
            ctx.beginPath();
            ctx.arc(lDotX, y, config.strands.left.radius * scaleLeftDot, 0, Math.PI * 2);
            ctx.fillStyle = config.strands.left.fill_color;
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }
    }

    offset += config.speed;
    if (enabled)
        requestAnimationFrame( () => { drawHelix(ctx, config) } );
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


// On load...
const canvas = document.getElementById('helixCanvas');
canvas.width = 180;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

canvas.onclick = () => {
    enabled = !enabled
    if (enabled) {
        drawHelix(ctx, config, 9);
    }
}

const config = {
    // Customize the helix/ sine wave here
    amplitude: 50,
    frequency: 0.02,
    speed: 0.005,
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
    width: canvas.width,
    height: canvas.height,
};


// const slider = document.getElementById("helix");
// slider.oninput = (e) => {
//     // console.log(e.target.value);
//     const adj = 9 + e.target.value * 0.001
//     drawHelix(ctx, config, adj);  // An engulfed frame
// }

drawHelix(ctx, config);
