var fs = require("fs")

const { Chess } = require("chess.js")

var data = fs.readFileSync("./data.txt", "utf-8", () => {})

data = data.split("\r\n")

data = data.map((e) => {
    return e.split("1. ")[e.split("1. ").length - 1].split(" ")
})

console.log(data)

var result = {}

var setValues = (obj, arr) => {

    if(arr.length === 0) return {"self": true, ...obj}

    if(!obj[arr[0]]) {
        const [, ...rest] = arr
        obj[arr[0]] = setValues({}, rest)
        obj.self = true
    } else {
        const [, ...rest] = arr
        obj[arr[0]] = setValues(obj[arr[0]], rest)
        obj.self = true
    }

    return obj
}

for(let i in data) {
    const chess = new Chess()

    //console.log(data[i])

    for(let m in data[i]) {
        if(data[i][m].includes(".")) continue
        if(!chess.moves().includes(data[i][m])) break
        chess.move(data[i][m])
    }

    var history = chess.history({ verbose: true })

    for(let h in history) {
        history[h] = history[h].lan
    }

    //console.log(history)
    result = setValues(result, history)

    //console.log(result)
}

//console.log(result)

fs.writeFileSync("./openings.json", JSON.stringify(result))