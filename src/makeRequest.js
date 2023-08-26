const https = require("https");
module.exports = class MakeRequest {
    constructor() {
        //const { lichessToken } = require("./private.json")

        this.lichessToken = ""

        this.https = require("https")
    }

    get(path, headers) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'lichess.org',
                port: 443,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.lichessToken,
                    ...headers
                }
            }

            this.https.get(options, (res) => {
                //console.log('statusCode:', res.statusCode)

                var data = ""

                res.on('data', (d) => {
                    data += d
                })

                res.on('end', () => {
                    resolve(data)
                })

            }).on('error', (e) => {
                reject(e)
            })
        })
    }

    post(path, data, headers) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'lichess.org',
                port: 443,
                path: path,
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.lichessToken,
                    'Content-Type': 'application/json',
                    'Content-Length': typeof data === 'object' ? JSON.stringify(data).length : data.length,
                    ...headers
                }
            }

            const req = https.request(options, (res) => {
                //console.log(`statusCode: ${res.statusCode}`)

                var data = ""

                res.on('data', (d) => {
                    data += d
                })

                res.on('end', () => {
                    resolve(data)
                })
            })

            req.on('error', (e) => {
                //console.log(e)
                reject(e)
            })

            req.write(JSON.stringify(data))
            req.end()
        })
    }

    stream(path, handler, headers) {
        const options = {
            hostname: 'lichess.org',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.lichessToken,
                ...headers
            }
        }

        this.https.get(options, (res) => {
            //console.log('statusCode:', res.statusCode)

            var data = ""

            res.on('data', (d) => {
                data += d

                var parts = data.split("\n")

                data = parts[parts.length - 1]
                parts.pop()

                for(let i in parts) {
                    handler(parts[i], path)
                }
            })

            res.on('end', () => {
            })

        }).on('error', (e) => {
            console.error(e)
            process.exit()
        })
    }
}