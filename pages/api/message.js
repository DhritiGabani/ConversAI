import {
    Configuration,
    OpenAIApi
} from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openAI = new OpenAIApi(configuration);

export default async function handler(req, res) {

    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    var messageResponse = new MessagingResponse();

    const sentMessage = req.body.Body || '';
    let replyToBeSent = "";

    if (sentMessage.trim().length === 0) {
        replyToBeSent = "We could not get your message. Please try again";
    } 
    else {
        try {
            const completion = await openAI.createCompletion({
                model: "text-davinci-003", 
                prompt: req.body.Body, 
                n: 1,
                temperature: 0.6,
                max_tokens: 150,
            });

            removeIncompleteText(completion.data.choices[0].text)        
        } 

        catch (error) {
            if (error.response) {
                console.log(error.response)
                replyToBeSent = "There was an issue with the server"
            } else { 
                replyToBeSent = "An error occurred during the request.";
            }
        }
    }

    messageResponse.message(replyToBeSent);

    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });

    res.end(messageResponse.toString());
}

function removeIncompleteText(inputString) {
    const match = inputString.match(/\b\.\s\d+/g);
    const removeAfter = match ? inputString.slice(0, inputString.lastIndexOf(match[match.length - 1])) : inputString;
    return removeAfter
 }