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
                // user_input =input("")
                model: "text-davinci-003", // required
                // message: [{"role" : "user", "content" : req.body.Body}],
                prompt: req.body.Body, // completion based on this
                n: 1,
                temperature: 0.6, //
                max_tokens: 150,
            });

            replyToBeSent = removeIncompleteText(completion.data.choices[0].text)
            // removeIncompleteText(completion.data.choices[0].message.content)
        } 

        catch (error) {
            if (error.response) {
                console.log(error.response)
                replyToBeSent = "There was an issue with the server"
            } else { // error getting response
                replyToBeSent = "An error occurred during your request.";
            }
        }
    }

    messageResponse.message(replyToBeSent);
    // send response

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