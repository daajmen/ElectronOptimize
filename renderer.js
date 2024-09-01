let fetchInterval; // Globala variabel för att hålla koll på intervallet

// Uppdatera output-funktionen för att visa meddelanden
function updateOutput(message) {
    const outputElement = document.getElementById('output');
    outputElement.innerText += message + '\n'; // Lägg till meddelandet i output-rutan
}

async function fetchToken(ip, user, password) {
    try {
        updateOutput('Hämtar token...');
        console.log('Attempting to fetch token'); // Felsökningsmeddelande

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
            return data.Token; // Returnera token från servern
        } else {
            console.log('Token request failed', response); // Felsökningsmeddelande
            throw new Error('Fel vid hämtning av token');
        }
    } catch (error) {
        updateOutput('Något gick fel: ' + error.message);
        console.error(error); // Felsökningsmeddelande
        throw error;
    }
}

async function fetchData(ip, token, tags) {
    try {
        const tagParams = tags.map(tag => `tag=${encodeURIComponent(tag)}`).join('&');
        const url = `http://${ip}/api/v1/tag/read?${tagParams}`;

        updateOutput(`Hämtar data från: ${url}`);
        console.log('Attempting to fetch data'); // Felsökningsmeddelande

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'token': token // Använd 'token' header istället för 'Authorization'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateOutput('Data hämtad:');
            updateOutput(JSON.stringify(data, null, 2)); // Formatera JSON för läsbarhet

            // Uppdatera tabellen med den hämtade datan
            updateTable(data);
        } else {
            console.log('Data request failed', response); // Felsökningsmeddelande
            updateOutput('Fel vid hämtning av data');
        }
    } catch (error) {
        updateOutput('Något gick fel: ' + error.message);
        console.error(error); // Felsökningsmeddelande
    }
}

function updateTable(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; // Töm tidigare data

    for (const tag in data) {
        if (data.hasOwnProperty(tag)) {
            const row = document.createElement('tr');

            // Taggnamn
            const tagCell = document.createElement('td');
            tagCell.textContent = tag;
            row.appendChild(tagCell);

            // Värde
            const valueCell = document.createElement('td');
            valueCell.textContent = data[tag].Value !== null ? data[tag].Value : 'N/A';
            row.appendChild(valueCell);

            // Tidsstämpel
            const timestampCell = document.createElement('td');
            timestampCell.textContent = data[tag].Timestamp || 'N/A';
            row.appendChild(timestampCell);

            // Status
            const statusCell = document.createElement('td');
            statusCell.textContent = data[tag].Status || 'N/A';
            row.appendChild(statusCell);

            // Lägg till raden i tabellen
            tableBody.appendChild(row);
        }
    }
}


function handleFetch() {
    console.log('handleFetch triggered'); // Felsökningsmeddelande

    const ip = document.getElementById('ip').value;
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    const tags = document.getElementById('tags').value.split('\n').map(tag => tag.trim()); // Dela upp på radbrytningar och trimma
    const interval = parseInt(document.getElementById('interval').value) * 1000; // Konvertera till millisekunder

    console.log('IP:', ip);
    console.log('User:', user);
    console.log('Tags:', tags);
    console.log('Interval:', interval, 'ms');

    if (!ip || !user || !password || tags.length === 0 || isNaN(interval) || interval <= 0) {
        updateOutput('Vänligen fyll i alla fält korrekt.');
        return;
    }

    // Rensa tidigare intervall om det finns
    if (fetchInterval) {
        clearInterval(fetchInterval);
        updateOutput('Tidigare intervall stoppat.');
    }

    fetchToken(ip, user, password).then(token => {
        fetchData(ip, token, tags); // Hämta data direkt efter token

        // Ställ in intervall för att hämta data kontinuerligt
        fetchInterval = setInterval(() => {
            fetchData(ip, token, tags);
        }, interval);

        updateOutput(`Hämtning av data startat med ${interval / 1000} sekunders intervall.`);
    }).catch(error => {
        updateOutput('Kunde inte hämta token: ' + error.message);
    });
}
