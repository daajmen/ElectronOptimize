let chartInstance;

export function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Kommer att uppdateras dynamiskt
            datasets: [{
                label: 'Taggdata',
                data: [], // Kommer att uppdateras dynamiskt
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // Viktigt för att göra den flexibelt skalbar
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tid'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Värde'
                    }
                }
            }
        }
    });
}

/**
 * Uppdatera grafen med ny data.
 * @param {Array} timestamps - Tidsstämplar för grafens X-axel.
 * @param {Array} values - Värden för grafens Y-axel.
 */
export function updateChart(timestamps, values) {
    if (chartInstance) {
        chartInstance.data.labels = timestamps; // Uppdatera X-axelns etiketter
        chartInstance.data.datasets[0].data = values; // Uppdatera datasetet
        chartInstance.update(); // Uppdatera grafen
    }
}
