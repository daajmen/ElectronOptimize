let fetchInterval;

// Funktion för att uppdatera output
function updateOutput(message) {
    const outputElement = document.getElementById('output');
    outputElement.innerText += message + '\n';
}

// Funktion för att hämta token
async function fetchToken(ip, user, password) {
    try {
        updateOutput('Hämtar token...');
        const response = await fetch(`http://${ip}/api/v1/access/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();
            updateOutput('Token hämtad.');
            return data.Token;
        } else {
            throw new Error('Fel vid hämtning av token');
        }
    } catch (error) {
        updateOutput('Något gick fel: ' + error.message);
        throw error;
    }
}

// Funktion för att hämta data
async function fetchData(ip, token, tags) {
    try {
        const tagParams = tags.map(tag => `tag=${encodeURIComponent(tag)}`).join('&');
        const url = `http://${ip}/api/v1/tag/read?${tagParams}`;

        updateOutput(`Hämtar data från: ${url}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'token': token
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateOutput('Data hämtad:');
            updateOutput(JSON.stringify(data, null, 2));
            updateTable(data);
        } else {
            updateOutput('Fel vid hämtning av data');
        }
    } catch (error) {
        updateOutput('Något gick fel: ' + error.message);
    }
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

    fetchToken(ip, user, password).then(token => {
        fetchData(ip, token, tags);

        fetchInterval = setInterval(() => {
            fetchData(ip, token, tags);
        }, interval);

        updateOutput(`Hämtning av data startat med ${interval / 1000} sekunders intervall.`);
    }).catch(error => {
        updateOutput('Kunde inte hämta token: ' + error.message);
    });
}

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

// När sidan laddas, uppdatera dropdown-listan med sparade IP-adresser
document.addEventListener('DOMContentLoaded', () => {
    updateIpDropdown();
    document.getElementById('fetch-button').addEventListener('click', handleFetch);
});
