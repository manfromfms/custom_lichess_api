module.exports = class Lichess {
    constructor(token) {
        // classes configurations
        this.UserClass = require("./UserClass")
        this.ChallengeClass = require("./ChallengeClass")
        this.GameClass = require("./GameClass")

        this.MR = require("./makeRequest")
        this.mr = new this.MR()
        this.mr.lichessToken = token

        // event functions
        this.onLogin = () => {}

        this.onNewInChallenge = (challenge) => {}
        this.onNewOutChallenge = (challenge) => {}
        this.onInChallengeDeleted = (challenge) => {}
        this.onOutChallengeDeleted = (challenge) => {}

        this.onGameStarted = async (game) => {}
        this.onGameEnded = async (game) => {}
        this.onGameChange = async (game, type) => {}


        //token
        this.token = token


        // bot data
        this.bot = {
            user: this.createUser("lichess")
        }


        // setup variables
        this.incomingChallenges = []
        this.outcomingChallenges = []

        this.currentGames = []


        // setup rates
        this.setChallengesUpdateRate(5000)
        this.setGamesUpdateRate(500)
    }

    setGamesUpdateRate(time) {
        clearInterval(this.gur)

        var func = () => {
            this.mr.get("/api/account/playing", {}).then(data => {
                //console.log(data)
                data = JSON.parse(data)

                var games = data.nowPlaying


                // update games list
                for(let j in this.currentGames) {
                    this.currentGames[j].exists = false
                }

                for(let i in games) {
                    var alreadyHave = false

                    for(let j in this.currentGames) {
                        if(this.currentGames[j].gameId === games[i].gameId) {
                            this.currentGames[j].exists = true

                            alreadyHave = true
                            break;
                        }
                    }

                    if(!alreadyHave) {
                        games[i].exists = true
                        this.currentGames.push(new this.GameClass(games[i], this.token))
                        this.onGameStartedFunction(this.currentGames[this.currentGames.length - 1])
                    }
                }

                var g = []
                for(let j in this.currentGames) {
                    if(this.currentGames[j].exists) g.push(this.currentGames[j])
                    else this.onGameEndedFunction(this.currentGames[j])
                }
                this.currentGames = g
            }).catch(console.log)
        }

        func()

        this.gur = setInterval(() => {
            func()
        }, time)
    }

    async onGameStartedFunction(game) {
        this.mr.stream("/api/bot/game/stream/" + game.gameId, (data, path)=> {
            if(data.length === 0) return

            data = JSON.parse(data)

            if(data.type === "gameFull") {
                for(let i in this.currentGames) {
                    if(this.currentGames[i].gameId === this.currentGames.gameId) {
                        this.currentGames[i] = {...this.currentGames[i], ...data}
                        this.onGameChange(this.currentGames[i], data.type)
                    }
                }
                return
            }

            if(data.type === "gameState") {
                for(let i in this.currentGames) {
                    if(this.currentGames[i].gameId === game.gameId) {
                        this.currentGames[i].state = {...this.currentGames[i].state, ...data}
                        this.onGameChange(this.currentGames[i], data.type)
                    }
                }
                return
            }

            //TODO: chat change support
            //TODO: claim win when opponent is gone
        }, {})

        await this.onGameStarted(game)
        await this.onGameChange(game, "gameFull")
        setTimeout(async () => {
            await this.onGameChange(game, "gameFull")
        }, 5000)
    }

    onGameEndedFunction(game) {
        this.onGameEnded(game)
    }

    createChallenge(user, params) {
        var data = {ok: true, ...params}

        if(typeof user === "string") this.mr.post("/api/challenge/" + user, data, {})
    }

    setChallengesUpdateRate(time) {
        clearInterval(this.cur)
        this.cur = setInterval(() => {
            this.mr.get("/api/challenge", {}).then(data => {
                data = JSON.parse(data)

                var ic = data.in
                var oc = data.out


                // update incoming challenges list
                for(let j in this.incomingChallenges) {
                    this.incomingChallenges[j].exists = false
                }

                for(let i in ic) {
                    var alreadyHave = false

                    for(let j in this.incomingChallenges) {
                        if(this.incomingChallenges[j].id === ic[i].id) {
                            this.incomingChallenges[j].exists = true

                            alreadyHave = true
                            break;
                        }
                    }

                    if(!alreadyHave) {
                        ic[i].exists = true
                        this.incomingChallenges.push(new this.ChallengeClass(ic[i], this.token))
                        this.onNewInChallenge(this.incomingChallenges[this.incomingChallenges.length - 1])
                    }
                }

                var tin = []
                for(let j in this.incomingChallenges) {
                    if(this.incomingChallenges[j].exists) tin.push(this.incomingChallenges[j])
                    else this.onInChallengeDeleted(this.incomingChallenges[j])
                }
                this.incomingChallenges = tin


                // update outcoming challenges list
                for(let j in this.outcomingChallenges) {
                    this.outcomingChallenges[j].exists = false
                }

                for(let i in oc) {
                    var alreadyHave = false

                    for(let j in this.outcomingChallenges) {
                        if(this.outcomingChallenges[j].id === oc[i].id) {
                            this.outcomingChallenges[j].exists = true

                            alreadyHave = true
                            break;
                        }
                    }

                    if(!alreadyHave) {
                        oc[i].exists = true
                        this.outcomingChallenges.push(new this.ChallengeClass(oc[i], this.token))
                        this.onNewOutChallenge(this.outcomingChallenges[this.outcomingChallenges.length - 1])
                    }
                }

                var tout = []
                for(let j in this.outcomingChallenges) {
                    if(this.outcomingChallenges[j].exists) tout.push(this.outcomingChallenges[j])
                    else this.onOutChallengeDeleted(this.outcomingChallenges[j])
                }
                this.outcomingChallenges = tout

            }).catch(console.log)
        }, time)
    }

    async login() {
        return new Promise(async (resolve, reject) => {
            this.bot.user.loadFromToken(this.token).then((data) => {
                this.onLogin(data)
                resolve(data)
            }).catch(reject)
        })
    }

    createUser(nickname) {
        var user = new this.UserClass(nickname)
        user.setToken(this.token)

        return user
    }
}