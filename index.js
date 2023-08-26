const LichessClass = require("./src/LichessClass")
const lichess = new LichessClass((process.argv.length === 3) ? process.argv[2] : require("./src/private.json").lichessToken)

const { spawn } = require('node:child_process');

const { Chess } = require("chess.js")

var stockfishObject = {}

var openings = {
    "standard": require("./src/openings.json"),
    "antichess": {self: true},
    "atomic": {self: true},
    "horde": {self: true},
    "kingOfTheHill": {self: true},
    "racingKings": {self: true},
    "threeCheck": {self: true},
}
//openings = {self:true}

var whitelist = "computerstuff; ya_ne_shahmatist; ninja_jahmir; myopic-bot; minduc12; maia9"

var variantsWhitelist = {
    "standard": "standard",
    "antichess": "antichess",
    "atomic": "atomic",
    "horde": "horde",
    "kingOfTheHill": "kingofthehill",
    "racingKings": "racingkings",
    "threeCheck": "3check",
    //"crazyHouse": "crazyhouse",
}

var getOpeningData = (moves, tree) => {
    if(moves.length === 0) return tree

    if(!tree[moves[0]]) return { self:true }

    const [, ...rest] = moves
    return getOpeningData(rest, tree[moves[0]])
}

lichess.onLogin = async (data) => {
    console.log("Logged in as " + data.id)

    /*lichess.createChallenge("ya_ne_shahmatist", {
        //rated 1+2
        rated: false,
        clock: {
            limit: 1,
            increment: 2,
        }
    })*/
}

lichess.onNewInChallenge = async (challenge) => {
    console.log("New incoming challenge:", challenge.id, "\t", challenge.timeControl.limit, "\t", challenge.timeControl.increment, "\t", challenge.variant.key, "\t", challenge.rated)
    //console.log(challenge)

    if((variantsWhitelist[challenge.variant.key]) && !challenge.rated) await challenge.accept().then(console.log).catch(console.log)
    else await challenge.decline().then(console.log).catch(console.log)
}

lichess.onGameStarted = async (game) => {
    console.log("game started:", game)

    //if(game.opponent.id === "computerstuff") await game.sendMessage("Hello random person who is watching this match! Rn i am playing a lot of matches against https://lichess.org/@/ComputerStuff. I will play random moves against you bcs i am a bit busy", false)

    stockfishObject[game.gameId] = {
        engine: "",
        calcPonder: false,
        position: ""
    }

    //stockfishObject[game.gameId].engine = spawn(__dirname + "/stockfish/stockfish-windows-x86-64-avx2.exe")
    stockfishObject[game.gameId].engine = spawn(__dirname + "/stockfish/fairy-stockfish-largeboard_x86-64.exe")
    //stockfishObject[game.gameId] = spawn("C:/Users/normc/Desktop/lc0/lc0.exe")

    //stockfishObject[game.gameId].stdin.write("uci\n")
    stockfishObject[game.gameId].engine.stdin.write("setoption name Threads value 5\n")
    stockfishObject[game.gameId].engine.stdin.write(`setoption name UCI_Variant value ${variantsWhitelist[game.variant.key]}\n`)
    stockfishObject[game.gameId].engine.stdin.write("ucinewgame\n")
    stockfishObject[game.gameId].engine.stdin.write(`position fen ${game.fen}\n`)

    stockfishObject[game.gameId].engine.stdout.on("data", data => {
        data = data.toString()

        //console.log(data)

        if(data.includes("bestmove")) {

            data = data.split("\n")

            for(let i in data) {
                if(data[i].includes("bestmove")) {
                    if(stockfishObject[game.gameId].calcPonder) {
                        stockfishObject[game.gameId].calcPonder = false
                        return
                    }

                    var move = data[i].split(" ")[1]

                    if(move.length === 5) {
                        if(!"qrbk".includes(move[4])) move = move.slice(0, 4)
                    } else if(move.length > 5) {
                        move = move.slice(0, 5)
                    }

                    game.makeMove(move)
                    console.log("Calculated move", move, "for game", game.gameId)

                    stockfishObject[game.gameId].calcPonder = true
                    stockfishObject[game.gameId].engine.stdin.write(stockfishObject[game.gameId].position + " " + move + '\n')
                    stockfishObject[game.gameId].engine.stdin.write("go\n")
                }
            }
        }
    })

    game.sendMessage("Hello there!", true)
}

lichess.onGameEnded = async (game) => {
    //console.log("game ended:", game.gameId)

    if(game.opponent.id === "computerstuff") {
        lichess.createChallenge("computerstuff", {
            rated: false,
            clock: {
                limit: 60,
                increment: 1,
                color: "random",
                variant: "standard"
            }
        })
    }

    stockfishObject[game.gameId].engine.kill()
}

lichess.onGameChange = async (game, type) => {
    console.log("game changed:", game.gameId, type)

    //console.log(game)

    var madeMoves = game.state ? game.state.moves.length === 0 ? [] : game.state.moves.split(" ") : []

    if(whitelist.includes(game.opponent.id) || true) {
        if((game.color === "white") === (madeMoves.length % 2 === 0)) {
            var openingData = getOpeningData(madeMoves, openings[game.variant.key])

            //console.log(openings[game.variant.key])

            var randomKey = game.fen === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" ? Object.keys(openingData)[Math.floor(Math.random() * Object.keys(openingData).length)] : "self"
            console.log(randomKey)

            if(randomKey === "self") {
                stockfishObject[game.gameId].engine.stdin.write("stop\n")
                stockfishObject[game.gameId].position = `position fen ${game.fen} moves ${game.state ? game.state.moves : ""}`
                stockfishObject[game.gameId].engine.stdin.write(`position fen ${game.fen} moves ${game.state ? game.state.moves : ""}\n`)

                //stockfishObject[game.gameId].engine.stdin.write(`go wtime ${game.state ? game.state.wtime : game.secondsLeft * 1000} winc ${game.state ? game.state.winc : "0"} btime ${game.state ? game.state.btime : game.secondsLeft * 1000} binc ${game.state ? game.state.binc : "0"}\n`)
                stockfishObject[game.gameId].engine.stdin.write(`go wtime 1000 winc 0 btime 1000 binc 0\n`)
            } else {
                await game.makeMove(randomKey)
            }
        }
    } else {
        const chess = new Chess()

        for(let i in madeMoves) {
            chess.move(madeMoves[i])
        }

        const moves = chess.moves({ verbose: true })
        const move = moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)].lan : ""

        if((game.color === "white") === (madeMoves.length % 2 === 0)) await game.makeMove(move)

        if(type === "gameState") {

        }
    }
}

lichess.login()