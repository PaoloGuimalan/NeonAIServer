const dictionary = require("../resources/json/dictionary.json")

function transmitIdentifierMain(data){
    var dataArray = []
    var sampleArray = Object.entries(dictionary)
    const typesArray = ["noun", "pronoun", "verb", "adjective", "adverb", "preposition", "conjunction", "interjection"]

    const randomTerms = (num) => {
        var selectedArray = []

        for(i = 0; i <= num; i++){
            if(i == num){
                selectedArray.push(sampleArray[Math.floor(Math.random() * sampleArray.length)])
                return selectedArray
            }
            else{
                selectedArray.push(sampleArray[Math.floor(Math.random() * sampleArray.length)])
            }
        }
    }

    const trainedWeights = () => {
        const examples = randomTerms(1000).map((dtls) => ({
            dtls,
            data: dataTeam(dtls)
        }))
    }

    const dataTeam = (datadlts) => {
        var arrayUnfolded = []
        var arrayForEachWord = []

        datadlts.map((mps, j) => {
            var arrayTypesHolder = []

            typesArray.map((entr, i) => {
                // console.log(`${i} ${typesArray.length - 1}`)
                if(i == typesArray.length - 1){
                    if(mps[1][1][entr] != undefined){
                        arrayTypesHolder.push({
                            name: entr,
                            count: mps[1][1][entr].length,
                            data: mps[1][1][entr]
                        })
                        // console.log(arrayTypesHolder)
                    }
                    arrayForEachWord.push({
                        word: mps[0],
                        content: arrayTypesHolder
                    })
                }
                else{
                    if(mps[1][1][entr] != undefined){
                        arrayTypesHolder.push({
                            name: entr,
                            count: mps[1][1][entr].length,
                            data: mps[1][1][entr]
                        })
                    }
                }
            })
        })

        return arrayForEachWord
    }

    data.split(" ").map((wrd, i) => {
        // dataArray.push()
        sampleArray.map((item, i) => {
            if(item[0] == wrd.toLowerCase()){
                dataArray.push(sampleArray[i])
            }
        })
    })

    // return dataArray
    // return Object.entries(dataArray)
    // return sampleArray[0]
    // return randomTerms(10)
    // return dataTeam(randomTerms(10))
    return dataTeam(dataArray)
}

module.exports = { 
    transmitIdentifierMain 
}