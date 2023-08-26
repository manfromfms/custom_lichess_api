module.exports = class GameClass {
    constructor(data, token) {
        for(let i in data) {
            this[i] = data[i]
        }

        this.MR = require("./makeRequest")
        this.mr = new this.MR()

        this.mr.lichessToken = token
    }

    async makeMove(move) {
        await this.mr.post(`/api/bot/game/${this.gameId}/move/${move}`, {ok:true}, {})
    }

    async sendMessage(text, toPlayer) {
        if(toPlayer) await this.mr.post(`/api/bot/game/${this.gameId}/chat`, {ok:true, text: text, room: "player"}, {}).then(console.log).catch(console.log)
        else await this.mr.post(`/api/bot/game/${this.gameId}/chat`, {ok:true, text: text, room: "spectator"}, {}).then(console.log).catch(console.log)
    }
}