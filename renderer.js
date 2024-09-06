import { fetchToken, fetchData } from './services/api.js';
import { saveIpToLocalStorage, updateIpDropdown } from './utils/ipManager.js';
import { updateTable } from './utils/tableManager.js'; // Importera funktionen här
import { initializeChart, updateChart } from './utils/chartManager.js'; // Importera Chart.js-hanteraren

let fetchInterval;

document.addEventListener('DOMContentLoaded', () => {
    updateIpDropdown();
    initializeChart(); // Initiera Chart.js när sidan laddas    
});

function updateOutput(message) {
    const outputElement = document.getElementById('output');
    outputElement.innerText += message + '\n';
}

function handleFetch() {
    const ip = document.getElementById('ip').value;
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    const tags = document.getElementById('tags').value.split('\n').map(tag => tag.trim());
    const interval = parseInt(document.getElementById('interval').value) * 1000;

    if (!ip || !user || !password || tags.length === 0 || isNaN(interval) || interval <= 0) {
        updateOutput('Vänligen fyll i alla fält korrekt.');
        return;
    }

    saveIpToLocalStorage(ip);

    if (fetchInterval) {
        clearInterval(fetchInterval);
        updateOutput('Tidigare intervall stoppat.');
    }

    fetchToken(ip, user, password, updateOutput).then(token => {
        fetchData(ip, token, tags, updateOutput, updateTable, window.electron.saveMeasurement);

        fetchInterval = setInterval(() => {
            fetchData(ip, token, tags, updateOutput, updateTable, window.electron.saveMeasurement);
        }, interval);

        updateOutput(`Hämtning av data startat med ${interval / 1000} sekunders intervall.`);
    }).catch(error => {
        updateOutput('Kunde inte hämta token: ' + error.message);
    });
}
document.getElementById('openChartBtn').addEventListener('click', () => {
    // Öppna ett nytt fönster
    const chartWindow = window.open('chartWindow.html', 'chartWindow', 'width=800,height=600');
});




window.handleFetch = handleFetch;
