let timer;
let isRunning = false;
let seconds = 0;

function startStop() {
    if (isRunning) {
        clearInterval(timer);
    } else {
        timer = setInterval(updateCronometro, 1000);
    }
    isRunning = !isRunning;
}

function resetCronometro() {
    clearInterval(timer);
    isRunning = false;
    seconds = 0;
    document.getElementById('cronometro').textContent = '00:00:00';
}

function updateCronometro() {
    seconds++;
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById('cronometro').textContent = `${hours}:${minutes}:${secs}`;
}
