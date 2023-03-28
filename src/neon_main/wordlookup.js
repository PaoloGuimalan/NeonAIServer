const nlp = require('compromise')
nlp.extend(require('compromise-sentences'))

function wordlookup(messageToken){
    var data =  nlp(messageToken)
    var verbs = data.verbs()
    var finalVerbs = verbs.text().split(" ")

    var nouns = data.nouns()
    var finalNouns = nouns.text().split(" ")

    // var possessiveCheck = data.possessive()
    // data.verbs()
    var detailedTags = nlp(messageToken).json()

    var arrayTags = data.out("tags")

    return arrayTags;
}

module.exports = {
    wordlookup
}