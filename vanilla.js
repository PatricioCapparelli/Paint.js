// CONSTANTS

const MODES = {
    DRAW: 'draw',
    ERASE: 'erase',
    RECTANGLE: 'rectangle',
    ELLIPSE: 'ellipse',
    PICKER: 'picker'
}

// UTILITIES

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// ELEMENTS

const $canvas = $('#canvas'); // Dom Element
const ctx = $canvas.getContext('2d',{ willReadFrequently: true });
const $colorPicker = $('#color-picker');
const $clearBtn = $('#clear-btn');
const $drawBtn = $('#draw-btn');
const $eraseBtn = $('#erase-btn');
const $pickerBtn = $('#picker-btn');
const $rectangleBtn = $('#rectangle-btn');
const $saveFile = $('#save-file');
const $ellipseBtn = $('#ellipse-btn')


// STATE

let isDrawing = false;
let isShiftPressed = false;
let startX, startY;
let lastX = 0;
let lastY = 0;
let mode = MODES.DRAW;
let previousMode = null;
let imageData;

// EVENTS

$canvas.addEventListener('mousedown', startDrawing);
$canvas.addEventListener('mousemove', draw);
$canvas.addEventListener('mouseup', stopDrawing);
$canvas.addEventListener('mouseleave', stopDrawing);

$colorPicker.addEventListener('change', handleChangeColor);
$clearBtn.addEventListener('click', handleClear);
$saveFile.addEventListener('click', saveDraw);

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)


$rectangleBtn.addEventListener('click',() => {
    setMode(MODES.RECTANGLE)
})
$drawBtn.addEventListener('click',() => {
    setMode(MODES.DRAW)
})
$eraseBtn.addEventListener('click',() => {
    setMode(MODES.ERASE)
})
$pickerBtn.addEventListener('click',() => {
    setMode(MODES.PICKER)
})
$ellipseBtn.addEventListener('click', () => {
    setMode(MODES.ELLIPSE);
});

window.addEventListener('resize', resizeCanvas);

// METHODS

function saveDraw(){
    const link = document.createElement('a');
    link.download = 'dibujo.png'; 
    link.href = $canvas.toDataURL('image/png'); 
    link.click(); 
}

function resizeCanvas() {
    
    $canvas.width = $canvas.clientWidth;
    $canvas.height = $canvas.clientHeight;
    
    // draw background white
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}
resizeCanvas();

function startDrawing(event){
    isDrawing = true
    const { offsetX, offsetY } = event

    // SAVE INITIAL COORDINATES
    
    ;[lastX, lastY] = [offsetX, offsetY]
    ;[startX, startY] = [offsetX, offsetY]

    //foto del canvas
    imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
}

function draw(event){
    if (!isDrawing) return 

    const { offsetX, offsetY } = event
    
    if(mode === MODES.DRAW || mode === MODES.ERASE){
        
    // starting the layout
    ctx.beginPath();

    // move the plot to the current coordinates
    ctx.moveTo(lastX, lastY);

    // draw a line between current coordinates and the new ones
    ctx.lineTo(offsetX, offsetY);

    ctx.stroke()

    // update the latest coordinates
    ;[lastX, lastY] = [offsetX, offsetY]

    return
    }

    if(mode === MODES.RECTANGLE){
        ctx.putImageData(imageData, 0, 0);
        // startX --> coordenada inicial del click
        let width = offsetX - startX
        let height = offsetY - startY

        if(isShiftPressed){
            const sideLength =  Math.min(
                Math.abs(width),
                Math.abs(height)
            )

            width = width > 0 ? sideLength : -sideLength
            height = height > 0 ? sideLength : -sideLength
        }

        ctx.beginPath()
        ctx.rect(startX, startY, width, height)
        ctx.stroke()
        return
    }

    if (mode === MODES.ELLIPSE) {
        ctx.putImageData(imageData, 0, 0);
        const radius = Math.sqrt(Math.pow(offsetX - startX, 2) + Math.pow(offsetY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
        return;
    }

}

function stopDrawing(event){
    isDrawing = false
    
}

function handleChangeColor(event){
const { value } = $colorPicker;
ctx.strokeStyle = value;

}

function handleClear(event){
    ctx.clearRect(0,0, canvas.width, canvas.height)
}

async function setMode(newMode){
    const oldMode = mode;
    mode = newMode
    // para limpiar la clase del boton activo actual.
    $('button.active')?.classList.remove('active')

    if(mode === MODES.DRAW) {
        $drawBtn.classList.add('active')
        $canvas.style.cursor = 'default'
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 2
        return
    }

    if(mode === MODES.RECTANGLE) {
        $rectangleBtn.classList.add('active')
        $canvas.style.cursor = 'nw-resize'
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 2
        return
    }

    if(mode === MODES.ERASE) {
        $eraseBtn.classList.add('active')
        $canvas.style.cursor = 'url("./assets/icons/borrador-borrar.png") 0 24, auto';
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = 20
        return
    }

    if(mode === MODES.PICKER){
        previousMode = oldMode;
        $pickerBtn.classList.add('active')
        const EyeDropper =  new window.EyeDropper()

        try{
            const result = await EyeDropper.open()
            const { sRGBHex } = result
            ctx.strokeStyle = sRGBHex
            $colorPicker.value = sRGBHex
            setMode(previousMode);
        } catch (e) {
            //error
        }
        return
    }

    if (mode === MODES.ELLIPSE) { 
        $ellipseBtn.classList.add('active')
        $canvas.style.cursor = 'nw-resize'
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 2
    }
    
}

function handleKeyDown({ key }){
    isShiftPressed = key === 'Shift'
}

function handleKeyUp({ key }){
    if(key === 'Shift') isShiftPressed = false
}

//INIT
setMode(MODES.DRAW);

//Show picker if browser has support
if(typeof window.EyeDropper !== 'undefined'){
    $pickerBtn.removeAttribute('disabled')
}
