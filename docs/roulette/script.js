// Funzione per aggiornare la barra inferiore
function aggiornaHistoryBar(numero, colore) {
  const historyBar = document.querySelector('.history-bar');
  const newItem = document.createElement('div');
  newItem.classList.add('history-item');
  newItem.style.backgroundColor = colore;
  newItem.textContent = numero;

  if (historyBar.firstChild) {
    historyBar.insertBefore(newItem, historyBar.firstChild);
  } else {
    historyBar.appendChild(newItem);
  }

  if (historyBar.childElementCount > 20) {
    historyBar.removeChild(historyBar.lastChild);
  }
}

document.getElementById('spinButton').addEventListener('click', function() {
    const numbers = document.querySelectorAll('.number');
    const ball = document.getElementById('ball');
    const result = document.getElementById('result');
    const wheel = document.querySelector('.roulette-wheel');
    const animationToggle = document.getElementById('animationToggle');

    if (!animationToggle.checked) {
        // Aggiungi l'animazione alla ruota
        wheel.classList.add('spinning');
        // Rimuovi l'animazione dopo 2 secondi
        setTimeout(function() {
            wheel.classList.remove('spinning');
        }, 2000);
    }

    // Genera un numero casuale tra 0 e 36
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const selectedNumber = numbers[randomIndex].dataset.number;

    // Posiziona la pallina sul numero estratto
    const selectedElement = numbers[randomIndex];
    const rect = selectedElement.getBoundingClientRect();
    const wheelRect = document.querySelector('.roulette-wheel').getBoundingClientRect();
    ball.style.top = `${rect.top - wheelRect.top + rect.height / 2}px`;
    ball.style.left = `${rect.left - wheelRect.left + rect.width / 2}px`;

    // Determina il colore, la parità e l'intervallo del numero estratto
    let color, parity, range;
    if (selectedNumber == 0) {
        color = 'verde';
        parity = 'n/a';
        range = 'n/a';
    } else {
        color = selectedElement.classList.contains('red') ? 'rosso' : 'nero';
        parity = selectedNumber % 2 === 0 ? 'pari' : 'dispari';
        range = selectedNumber <= 18 ? 'basso' : 'alto';
    }

    const selectedColor = (color === 'verde') ? 'green' : (color === 'rosso') ? 'red' : 'black';
    aggiornaHistoryBar(selectedNumber, selectedColor);

    // Mostra il risultato con l'animazione di sfondo verde
    result.textContent = `Numero estratto: ${selectedNumber} (${color}, ${parity}, ${range})`;
    result.classList.add('flash-background'); // Cambia animazione di sfondo
    // Rimuovi l'animazione di sfondo dopo un secondo
    setTimeout(function() {
        result.classList.remove('flash-background');
    }, 1000);
});