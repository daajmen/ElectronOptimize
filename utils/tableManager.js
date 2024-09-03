

export function updateTable(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; // Rensa tidigare data

    // Iterera över objektets egenskaper
    for (const tag in data) {
        if (data.hasOwnProperty(tag)) {
            const row = document.createElement('tr');

            const tagCell = document.createElement('td');
            tagCell.textContent = tag; // Nyckeln från objektet
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
