import fetch from 'node-fetch';
import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function generateComment(temp, humidity, moisture) {
    let prompt = `Create a fun comment about a houseplant given these conditions, round numbers to nearest decimal point. Make sure to complete sentences fully 
    before sending response: Temperature is ${temp}°C, Humidity is ${humidity}%, Soil Moisture is ${moisture}%.`;
    console.log("Generated Prompt:", prompt);

    const data = {
        model: "gpt-3.5-turbo",  
        messages: [{
            role: "system",
            content: prompt
        }],
        max_tokens: 40,
        temperature: 0.7
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
        console.log("OpenAI Response:", result);

        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            return result.choices[0].message.content.trim();
        } else {
            console.log("No choices available in response.");
            return '';
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return '';
    }
}

export { generateComment };
