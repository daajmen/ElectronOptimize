// ipManager.js

// Spara IP-adressen i localStorage och uppdatera dropdown
export function saveIpToLocalStorage(ip) {
    let savedIPs = JSON.parse(localStorage.getItem('savedIPs')) || [];
    if (!savedIPs.includes(ip)) {
        savedIPs.push(ip);
        localStorage.setItem('savedIPs', JSON.stringify(savedIPs));
        updateIpDropdown();
    }
}

// Uppdatera dropdown med sparade IP-adresser
export function updateIpDropdown() {
    const ipList = document.getElementById('ip-list');
    ipList.innerHTML = ''; // Rensa befintliga alternativ
    const savedIPs = JSON.parse(localStorage.getItem('savedIPs')) || [];
    savedIPs.forEach(ip => {
        const option = document.createElement('option');
        option.value = ip;
        ipList.appendChild(option);
    });
}
