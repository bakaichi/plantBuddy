import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/engines/davinci/completions";

// generate a comment based on the plant condition
async function generateComment(temp, humidity, moisture) {
    const prompt = `Given the following sensor readings: Temperature: ${temp}°C, Humidity: ${humidity}%, Moisture: ${moisture} - provide a brief witty comment on the plants condition.`;

    const data = {
        prompt: prompt,
        max_tokens: 60,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.choices && result.choices.length > 0) {
            return result.choices[0].text.trim();
        } else {
            console.log("No choices available in response.");
            return '';
        }
    } catch (error) {
        console.error("Error calling OpenAi Api:", error);
        return '';
    }
}

export { generateComment };