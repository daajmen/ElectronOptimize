export async function fetchToken(ip, user, password, updateOutput) {
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

export async function fetchData(ip, token, tags, updateOutput, updateTable, saveMeasurement) {
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

            let measurementData = {
                timestamp: null,
                measurement: null,
                setpoint: null,
                valve: null,
                P: null,
                I: null,
                D: null
            };

            for (const tag in data) {
                if (data.hasOwnProperty(tag)) {
                    const timestamp = data[tag].Timestamp;
                    const value = data[tag].Value;

                    measurementData.timestamp = timestamp;

                    if (tag.endsWith('_PV')) {
                        measurementData.measurement = value;
                    } else if (tag.endsWith('_SP')) {
                        measurementData.setpoint = value;
                    } else if (tag.endsWith('_OP')) {
                        measurementData.valve = value;
                    } else if (tag.endsWith('_P')) {
                        measurementData.P = value;
                    } else if (tag.endsWith('_I')) {
                        measurementData.I = value;
                    } else if (tag.endsWith('_D')) {
                        measurementData.D = value;
                    }
                }
            }

            saveMeasurement(
                measurementData.timestamp,
                measurementData.measurement,
                measurementData.setpoint,
                measurementData.valve,
                measurementData.P,
                measurementData.I,
                measurementData.D
            );
        } else {
            updateOutput('Fel vid hämtning av data');
        }
    } catch (error) {
        updateOutput('Något gick fel: ' + error.message);
    }
}