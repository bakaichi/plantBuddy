// fetch latest data from single store / express server 
async function fetchLatestData(){
  try {
    console.log('Fetching data from the server..');
    const response = await fetch('http://localhost:3000/api/latest-reading');
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const latestReading = await response.json();
    console.log('Latest reading: ', latestReading);

    return latestReading;
  } catch(error) {
    console.error('Error fetching data: ', error);
    return fetchDataFromLocal();
  }
}

// fallback in case server is not online, fetches data from local file
async function fetchDataFromLocal() {
  try {
    const response = await fetch('../mqttData.json');
    if (!response.ok) {
      throw new Error('Local data fetch failed.');
    }
    const mqttData = await response.json();
    const readings = mqttData.plantBuddy.readings;
    return readings.length > 0 ? readings[readings.length - 1] : null;
  } catch (error) {
    console.error('Error fetching data from local file: ', error);
    return null;
  }
}

// Function to round the numbers for incoming data
function roundData(data) {
  if (!data) return null;

  return {
    temp: Math.round(data.temp * 100) / 100,
    humidity: Math.round(data.humidity * 100) / 100,
    moisture: data.moisture,
    timestamp: data.timestamp,
    aiComment: data.aiComment
  };
}

// display updated data for html use
async function updateLatestDataOnPage() {
  const latestData = await fetchLatestData();
  const roundedData = roundData(latestData);

  if (latestData) {
    document.getElementById('temperature').textContent = roundedData.temp;
    document.getElementById('humidity').textContent = roundedData.humidity;
    document.getElementById('moisture').textContent = roundedData.moisture;
    document.getElementById('aiComment').textContent = roundedData.aiComment;
  }
}

// call the function every time the page is loaded
window.onload = updateLatestDataOnPage;


