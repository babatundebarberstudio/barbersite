const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { to, message } = JSON.parse(event.body);

        if (!to || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields: to, message' })
            };
        }

        // Textbelt credentials
        const textbeltApiKey = '9b579ce6c9a49bc0da0cefb41c723b3eeac11900IuDuGnL2gaf67OpXoJSawwvvQ';

        // Format phone number (remove any non-digit characters and add 1 if needed)
        const phoneNumber = to.replace(/\D/g, '');
        const formattedPhone = phoneNumber.startsWith('1') ? phoneNumber : '1' + phoneNumber;

        // Textbelt API endpoint
        const url = 'https://textbelt.com/text';

        // Send SMS via Textbelt
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: formattedPhone,
                message: message,
                key: textbeltApiKey
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Textbelt API error:', result);
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'Failed to send SMS', 
                    details: result.error || 'Unknown error' 
                })
            };
        }

        if (!result.success) {
            console.error('Textbelt API error:', result);
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'Failed to send SMS', 
                    details: result.error || 'Unknown error' 
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                textId: result.textId,
                message: 'SMS sent successfully via Textbelt' 
            })
        };

    } catch (error) {
        console.error('Error sending SMS:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error', 
                details: error.message 
            })
        };
    }
};
