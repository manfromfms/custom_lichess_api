module.exports = class ChallengeClass {
    constructor(data, token) {
        for(let i in data) {
            this[i] = data[i]
        }

        this.MR = require("./makeRequest")
        this.mr = new this.MR()

        this.mr.lichessToken = token
    }

    /*
    {
        "id": "VU0nyvsW",
        "url": "https://lichess.org/VU0nyvsW",
        "color": "random",
        "direction": "out",
        "timeControl": {
            "increment": 2,
            "limit": 300,
            "show": "5+2",
            "type": "clock"
        },
        "variant": {
            "key": "standard",
            "name": "Standard",
            "short": "Std"
        },
        "challenger": {
            "id": "thibot",
            "name": "thibot",
            "online": true,
            "provisional": false,
            "rating": 1940,
            "title": "BOT"
        },
        "destUser": {
            "id": "leelachess",
            "name": "LeelaChess",
            "online": true,
            "provisional": true,
            "rating": 2670,
            "title": "BOT"
        },
        "perf": {
            "icon": ";",
            "name": "Correspondence"
        },
        "rated": true,
        "speed": "blitz",
        "status": "created"
    }
    */

    async accept() {
        return new Promise((resolve, reject) => {
            this.mr.post(`/api/challenge/${this.id}/accept`, {"ok":true}, {}).then(resolve).catch(reject)
        })
    }

    async decline() {
        return new Promise((resolve, reject) => {
            this.mr.post(`/api/challenge/${this.id}/decline`, {"ok":true}, {}).then(resolve).catch(reject)
        })
    }

    async cancel() {
        return new Promise((resolve, reject) => {
            this.mr.post(`/api/challenge/${this.id}/cancel`, {"ok":true}, {}).then(resolve).catch(reject)
        })
    }
}