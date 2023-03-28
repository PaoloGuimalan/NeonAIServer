const nlp = require('compromise')
nlp.extend(require('compromise-sentences'))

function isFullSentence(sentenceProp){
    var hasNoun = nlp(sentenceProp).nouns().out("array").length == 0? false : true
    var hasVerb = nlp(sentenceProp).verbs().out("array").length == 0? false : true

    if(hasNoun && hasVerb){
        return true;
    }
    else{
        return false;
    }
}

function splitMulti(str, tokens){
    var tempChar = tokens[0]; // We can use the first token as a temporary join character
    for(var i = 1; i < tokens.length; i++){
        str = str.split(tokens[i]).join(tempChar);
    }
    str = str.split(tempChar);
    return str;
}

function checkModalforYesNoQuestions(sentcs, verbArr, terms){
    var modalVerbs = []
    var questionWords = []
    var auxiliaryWords = []

    var customAuxVerbs = ["am", "do", "might", "are", "does", "must", "shall", "has", "should", 
    "can", "have", "was", "could", "were", "is", "will", "did", "may", "would"]

    var dividedTags = nlp(sentcs).verbs().out("tags")

    // console.log(verbArr)

    verbArr.map((vr, i) => {
        // console.log(dividedTags[i][vr.toLowerCase()], i, dividedTags, vr)
        if(dividedTags[i][vr.toLowerCase().trim().replace(/[^a-zA-Z ]/g, "")].includes("QuestionWord")){
            questionWords.push(vr)
        }
        
        if(dividedTags[i][vr.toLowerCase().trim().replace(/[^a-zA-Z ]/g, "")].includes("Modal")){
            modalVerbs.push(vr)
        }

        if(dividedTags[i][vr.toLowerCase().trim().replace(/[^a-zA-Z ]/g, "")].includes("Auxiliary")){
            auxiliaryWords.push(vr)
        }

        if(customAuxVerbs.includes(vr.toLowerCase().trim().replace(/[^a-zA-Z ]/g, ""))){
            if(terms[0].toLowerCase().trim().replace(/[^a-zA-Z ]/g, "") == vr.toLowerCase().trim().replace(/[^a-zA-Z ]/g, "")){
                auxiliaryWords.push(vr)
            }
        }
    })

    return modalVerbs.length > 0 || questionWords.length > 0 || auxiliaryWords.length > 0? true : false;
}

function processMessage(messageToken){
    var data = nlp(messageToken)
    var checkSentenceLength = data.sentences().length
    var parseSentences = data.sentences().json()
    var extractSentences = parseSentences.map((st, i) => st.text);
    var getConjuctions = extractSentences.map((ext, i) => {
        var conjunctions = nlp(ext).conjunctions().out("array")
        var uniqueConj = [...new Set(conjunctions)];
        var splitSentence = splitMulti(ext, uniqueConj)
        var separatedSentences = []
        var checkedIndex = []
        var checkSentences = splitSentence.map((spl, i) => {
            if(isFullSentence(spl)){
                if(!checkedIndex.includes(i)){
                    if(splitSentence[i + 1] != undefined){
                        if(isFullSentence(splitSentence[i + 1])){
                            separatedSentences.push(spl)
                        }
                        else{
                            separatedSentences.push(spl + conjunctions[i] + splitSentence[i + 1])
                        }
                    }
                    else{
                        if(conjunctions[i + 1] != undefined){
                            separatedSentences.push(spl + conjunctions[i])
                        }
                        else{
                            separatedSentences.push(spl)
                        }
                    }
                }
            }
            else{
                if(i + 1 != splitSentence.length){
                    if(!checkedIndex.includes(i)){
                        if(isFullSentence(splitSentence[i + 1] + conjunctions[i + 1] + splitSentence[i + 2])){
                            separatedSentences.push(spl + conjunctions[i] + splitSentence[i + 1])
                        }
                        else{
                            if(splitSentence[i + 2] != undefined){
                                separatedSentences.push(splitSentence[i] + conjunctions[i] + splitSentence[i + 1] + conjunctions[i + 1] + splitSentence[i + 2])
                            }
                            else{
                                if(conjunctions[i + 1] != undefined){
                                    separatedSentences.push(splitSentence[i] + conjunctions[i] + splitSentence[i + 1] + conjunctions[i + 1])
                                }
                                else{
                                    separatedSentences.push(splitSentence[i] + conjunctions[i] + splitSentence[i + 1])
                                }
                            }
                        }
                        checkedIndex = [...checkedIndex, i, i + 1]
                    }
                }
                else{
                    if(!checkedIndex.includes(i)){
                        if(isFullSentence(splitSentence[i - 1] + conjunctions[i - 1] + spl)){
                            separatedSentences.push(splitSentence[i - 1] + conjunctions[i - 1] + spl)
                        }
                    }
                }
            }
        })
        return [...new Set(separatedSentences)]
    }).flat(1)
    // var checkConjunctions = extractSentences.map((extcj, i) => extcj)
    var extractedSentencesWTags = extractSentences.map((ex, i) => nlp(ex).out("tags"))
    // var isPhrasesPositive = extractSentences.map((ex, i) => {
    var isPhrasesPositive = getConjuctions.map((ex, i) => {
        if(ex == nlp(ex).sentences().toPositive().text()){
            return {
                text: ex,
                isPositive: true,
                isQuestion: nlp(ex).sentences().isQuestion().out("array").length == 0? false : true,
                isExclamation: nlp(ex).sentences().isExclamation().out("array").length == 0? false : true,
                isStatement: nlp(ex).sentences().isStatement().out("array").length == 0? false : true,
                isAnswerableByYesNo: nlp(ex).sentences().isQuestion().out("array").length == 0? false : checkModalforYesNoQuestions(ex, nlp(ex).verbs().out("array"), ex.split(" ")),
                isCommand: "pending",
                subjects: nlp(ex).verbs().subjects().out("array"),
                nouns: nlp(ex).nouns().out("array"),
                adjectives: nlp(ex).nouns().adjectives().out("array"),
                verbs: nlp(ex).verbs().out("array"),
                adverbs: nlp(ex).verbs().adverbs().out("array"),
                conjugations: nlp(ex).verbs().conjugate(),
                accuracy: nlp(ex).confidence()
            }
        }
        else{
            return {
                text: ex,
                isPositive: false,
                isQuestion: nlp(ex).sentences().isQuestion().out("array").length == 0? false : true,
                isExclamation: nlp(ex).sentences().isExclamation().out("array").length == 0? false : true,
                isStatement: nlp(ex).sentences().isStatement().out("array").length == 0? false : true,
                isAnswerableByYesNo: nlp(ex).sentences().isQuestion().out("array").length == 0? false : checkModalforYesNoQuestions(ex, nlp(ex).verbs().out("array"), ex.split(" ")),
                isCommand: "pending",
                subjects: nlp(ex).verbs().subjects().out("array"),
                nouns: nlp(ex).nouns().out("array"),
                adjectives: nlp(ex).nouns().adjectives().out("array"),
                verbs: nlp(ex).verbs().out("array"),
                adverbs: nlp(ex).verbs().adverbs().out("array"),
                conjugations: nlp(ex).verbs().conjugate(),
                accuracy: nlp(ex).confidence()
            }
        }
    })

    return isPhrasesPositive;
}

module.exports = {
    processMessage
}

/**
 * Return an object that consist of combinations of nouns and verbs to check if what is the most
 * accurate action to be performed. Check first the arrays of nouns and verbs if empty and make server
 * respond on this issue. Also, pass the type of sentences currently scanned - (question, statement, etc.)
 * 
 * Make a case statement in front end enlisting the actions available in the system and check if that
 * is the case the server's generated action is in need to perform. Pass available actions array from front end
 * so that the server will now the best action to be passed in the front end.
 * 
 * For Response: check conjugations, generate past tense response after the action is executed, 
 * present tense or future tense before the action to be executed. This prompts should be in random, 
 * by using arrays.
 * 
 * Separate message by conjunctions and check if it is a full sentence - DONE
 * 
 * For conversation responses: check other arrays and create algorithm later
 * 
 * Put only one word as action trigger in client side to be passed in server and get all synonyms of that word
 * using Synonym library, so that it will understand even if you use any word that has same meaning with action trigger word
 */