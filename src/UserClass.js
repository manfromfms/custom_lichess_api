module.exports = class UserClass {
    constructor(nickname) {
        this.nickname = nickname
        this.id = this.nickname.toLowerCase()
        this.MR = require("./makeRequest")
        this.mr = new this.MR()
    }

    setToken(token) {
        this.mr.lichessToken = token
    }

    async expand () {                /* Ask for more user data */
        return new Promise((resolve, reject) => {
            this.mr.get(`/api/user/${this.nickname}`, {}).then((data) => {
                data = JSON.parse(data)

                /* Data response sample
                {
                  id: 'ya_ne_shahmatist',
                  username: 'ya_ne_shahmatist',
                  perfs: {
                    blitz: { games: 0, rating: 1500, rd: 500, prog: 0, prov: true },
                    antichess: { games: 902, rating: 1760, rd: 45, prog: 2 },
                    puzzle: { games: 117, rating: 1305, rd: 114, prog: 0, prov: true },
                    atomic: { games: 50, rating: 1410, rd: 185, prog: 146, prov: true },
                    racingKings: { games: 1, rating: 1596, rd: 429, prog: 0, prov: true },
                    bullet: { games: 6, rating: 670, rd: 142, prog: 0, prov: true },
                    correspondence: { games: 0, rating: 1500, rd: 500, prog: 0, prov: true },
                    classical: { games: 0, rating: 1500, rd: 500, prog: 0, prov: true },
                    rapid: { games: 3, rating: 943, rd: 225, prog: 0, prov: true }
                  },
                  createdAt: 1605150368913,
                  profile: { country: 'RU', bio: 'Hello there' },
                  seenAt: 1691559791637,
                  playTime: { total: 344012, tv: 1388 },
                  url: 'https://lichess.org/@/ya_ne_shahmatist',
                  count: {
                    all: 1448,
                    rated: 962,
                    ai: 6,
                    draw: 27,
                    drawH: 27,
                    loss: 743,
                    lossH: 738,
                    win: 678,
                    winH: 677,
                    bookmark: 4,
                    playing: 0,
                    import: 10,
                    me: 33
                  },
                  followable: true,
                  following: true,
                  blocking: false,
                  followsYou: true
                }
                 */

                if(data.disabled) {
                    this.disabled = true

                    resolve(data)
                    return
                }

                this.perfs = data.perfs
                this.createdAt = data.createdAt
                this.disabled = false
                this.tosViolation = data.tosViolation
                this.profile = data.profile
                this.seenAt = data.seenAt
                this.patron = data.patron
                this.verified = data.verified
                this.playTime = data.playTime
                this.title = data.title
                this.url = data.url
                this.playing = data.playing
                this.count = data.count
                this.streaming = data.streaming
                this.followable = data.followable
                this.following = data.following
                this.blocking = data.blocking
                this.followsYou = data.followsYou

                //console.log(data)

                resolve(data)
            }).catch(reject)
        })
    }

    async loadFromToken() {                /* Load user data from API token */
        return new Promise((resolve, reject) => {
            this.mr.get('/api/account', {}).then((data) => {
                data = JSON.parse(data)

                this.nickname = data.nickname
                this.id = data.id

                /* Data response sample
                {
                  id: 'ya_ne_shahmatist',
                  username: 'ya_ne_shahmatist',
                  perfs: {
                    blitz: { games: 0, rating: 1500, rd: 500, prog: 0, prov: true },
                    antichess: { games: 902, rating: 1760, rd: 45, prog: 2 },
                    puzzle: { games: 117, rating: 1305, rd: 114, prog: 0, prov: true },
                    atomic: { games: 50, rating: 1410, rd: 185, prog: 146, prov: true },
                    racingKings: { games: 1, rating: 1596, rd: 429, prog: 0, prov: true },
                    bullet: { games: 6, rating: 670, rd: 142, prog: 0, prov: true },
                    correspondence: { games: 0, rating: 1500, rd: 500, prog: 0, prov: true },
                    classical: { games: 0, rating: 1500, rd: 500, prog: 0, prov: true },
                    rapid: { games: 3, rating: 943, rd: 225, prog: 0, prov: true }
                  },
                  createdAt: 1605150368913,
                  profile: { country: 'RU', bio: 'Hello there' },
                  seenAt: 1691559791637,
                  playTime: { total: 344012, tv: 1388 },
                  url: 'https://lichess.org/@/ya_ne_shahmatist',
                  count: {
                    all: 1448,
                    rated: 962,
                    ai: 6,
                    draw: 27,
                    drawH: 27,
                    loss: 743,
                    lossH: 738,
                    win: 678,
                    winH: 677,
                    bookmark: 4,
                    playing: 0,
                    import: 10,
                    me: 33
                  },
                  followable: true,
                  following: true,
                  blocking: false,
                  followsYou: true
                }
                 */

                if(data.disabled) {
                    this.disabled = true

                    resolve(data)
                    return
                }

                this.perfs = data.perfs
                this.createdAt = data.createdAt
                this.disabled = false
                this.tosViolation = data.tosViolation
                this.profile = data.profile
                this.seenAt = data.seenAt
                this.patron = data.patron
                this.verified = data.verified
                this.playTime = data.playTime
                this.title = data.title
                this.url = data.url
                this.playing = data.playing
                this.count = data.count
                this.streaming = data.streaming
                this.followable = data.followable
                this.following = data.following
                this.blocking = data.blocking
                this.followsYou = data.followsYou

                //console.log(data)

                resolve(data)
            }).catch(reject)
        })
    }

    async sendMessage(text) {               /* Send message to a user (currently not working due to spam issues)*/
        this.mr.post("/inbox/" + this.nickname, {text: text}, {}).then(console.log).catch(console.log)
    }
}