document.getElementById('spinButton').addEventListener('click', function() {
    const numbers = document.querySelectorAll('.number');
    const ball = document.getElementById('ball');
    const result = document.getElementById('result');

    // Genera un numero casuale tra 0 e 36
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const selectedNumber = numbers[randomIndex].dataset.number;

    // Posiziona la pallina sul numero estratto
    const selectedElement = numbers[randomIndex];
    const rect = selectedElement.getBoundingClientRect();
    const wheelRect = document.querySelector('.roulette-wheel').getBoundingClientRect();

    ball.style.top = `${rect.top - wheelRect.top + rect.height / 2}px`;
    ball.style.left = `${rect.left - wheelRect.left + rect.width / 2}px`;

    // Mostra il risultato
    result.textContent = `Numero estratto: ${selectedNumber}`;
});
