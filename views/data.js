// Create a function to fetch the latest data
async function fetchLatestData() {
  try {
    console.log('Fetching data from mqttData.json...');
    const response = await fetch('../mqttData.json');
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    console.log('Data fetched successfully:', data);

    // Get the latest reading (last entry) from the readings array
    const latestReading = data.plantBuddy.readings[data.plantBuddy.readings.length - 1];
    console.log('Latest reading:', latestReading);
    
    return latestReading;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Function to round the numbers
function roundData(data) {
  if (!data) return null;

  return {
    temp: Math.round(data.temp * 100) / 100,
    humidity: Math.round(data.humidity * 100) / 100,
    moisture: data.moisture,
    timestamp: data.timestamp
  };
}

// Function to update the latest data on the HTML page
export async function updateLatestDataOnPage() {
  const latestData = await fetchLatestData();
  const roundedData = roundData(latestData);

  if (roundedData) {
    document.getElementById('temperature').textContent = roundedData.temp;
    document.getElementById('humidity').textContent = roundedData.humidity;
    document.getElementById('moisture').textContent = roundedData.moisture;
    document.getElementById('timestamp').textContent = roundedData.timestamp;
  }
}


