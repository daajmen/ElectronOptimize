import { fetchToken, fetchData } from './services/api.js';

let fetchInterval;

document.addEventListener('DOMContentLoaded', () => {
    updateIpDropdown();
});

// Funktion för att uppdatera output
function updateOutput(message) {
    const outputElement = document.getElementById('output');
    outputElement.innerText += message + '\n';
}

// Funktion för att uppdatera tabellen
function updateTable(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    for (const tag in data) {
        if (data.hasOwnProperty(tag)) {
            const row = document.createElement('tr');

            const tagCell = document.createElement('td');
            tagCell.textContent = tag;
            row.appendChild(tagCell);

            const valueCell = document.createElement('td');
            valueCell.textContent = data[tag].Value !== null ? data[tag].Value : 'N/A';
            row.appendChild(valueCell);

            const timestampCell = document.createElement('td');
            timestampCell.textContent = data[tag].Timestamp || 'N/A';
            row.appendChild(timestampCell);

            const statusCell = document.createElement('td');
            statusCell.textContent = data[tag].Status || 'N/A';
            row.appendChild(statusCell);

            tableBody.appendChild(row);
        }
    }
}

// Funktion för att hantera hämtning
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

    // Spara IP-adressen i localStorage
    saveIpToLocalStorage(ip);

    // Rensa tidigare intervall om det finns
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

// Gör handleFetch globalt tillgänglig
window.handleFetch = handleFetch;
// Spara IP-adressen i localStorage och uppdatera dropdown
function saveIpToLocalStorage(ip) {
    let savedIPs = JSON.parse(localStorage.getItem('savedIPs')) || [];
    if (!savedIPs.includes(ip)) {
        savedIPs.push(ip);
        localStorage.setItem('savedIPs', JSON.stringify(savedIPs));
        updateIpDropdown();
    }
}

// Uppdatera dropdown med sparade IP-adresser
function updateIpDropdown() {
    const ipList = document.getElementById('ip-list');
    ipList.innerHTML = ''; // Rensa befintliga alternativ
    const savedIPs = JSON.parse(localStorage.getItem('savedIPs')) || [];
    savedIPs.forEach(ip => {
        const option = document.createElement('option');
        option.value = ip;
        ipList.appendChild(option);
    });
}


