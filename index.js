const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mysql = require("mysql");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const socketIO = require("socket.io");

const natural = require('natural');

// const { transmitIdentifierMain } = require("./src/neon_main/transmitIdentifier")
const { wordlookup } = require("./src/neon_main/wordlookup")
// const dictionaryData = require("./src/resources/json/dictionary.json");
const { processMessage } = require("./src/neon_main/processMessage");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}))

app.listen(PORT, () => {
    console.log(`Server running at Port ${PORT}`);
})

// app.get('/dictionary/:wordData', (req, res) => {
//     const wordData = req.params.wordData;
//     res.send(transmitIdentifierMain(wordData))
// })

app.post('/processMessage', (req, res) => {
    const message = req.body.message;

    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(message);

    const tagger = new natural.BrillPOSTagger();
    tagger.addRuleModule(new natural.RuleBasedTagger());
    const taggedWords = tagger.tag(words);

    // Identify the keywords in the sentence
    const keywords = taggedWords.filter(([word, pos]) => {
    return pos.startsWith('NN') || pos === 'JJ';
    }).map(([word, pos]) => word);

    // Output the keywords
    console.log(keywords);

    res.send({status: true, result: "OK"})
})

app.get('/testProcessMessage/:message', (req, res) => {
    const message = req.params.message

    const tokenizer = new natural.WordTokenizer();
    const messageToken = tokenizer.tokenize(message)

    // var finalLookup = wordlookup(message)
    var processMessageFinal = processMessage(message)

    res.send({status: true, result: processMessageFinal})
})