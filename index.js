const http = require('http');
const fs = require('fs');
const path = require('path');

const axios = require('axios');

const dpids = require('./dpid');

const requestHandeler = (req, res) => {
    let method = req.method;
    let url = req.url;

    let queries = '';

    let urlSplit = url.split("?");

    url = urlSplit[0]
    if (urlSplit.length > 1) {
        queries = urlSplit[1]
    }

    console.log(method, url, queries);

    if (method == "GET" && (url == "/" || url == "/index.css" || url == "/index.js" || url == "/dpid.js")) {
        let file;
        let contentType;
        if (url == "/" || url == '/index.html') {
            file = 'public/index.html';
            contentType = 'text/html'
        }
        if (url == '/index.css') {
            file = 'public/index.css';
            contentType = 'text/css'
        }
        if (url == '/index.js') {
            file = 'public/index.js';
            contentType = 'application/javascript'
        }
        if (url == '/dpid.js') {
            file = 'dpid.js';
            contentType = 'application/javascript'
        }
        var filePath = path.join(__dirname, file);
        var stat = fs.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size
        });

        var readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        return;
    }

    if (method == "POST" && url == "/") {

        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            let data = JSON.parse(body);
            // console.log(data);

            let promises = [];
            data.boidArray.forEach(element => {

                // let's first validate the boid

                let dpid = element.slice(0, 8);
                if (dpids[dpid]) {
                    // console.log("valid dpid");
                    promises.push(getIPOResult(element, data.companyShareId));
                }

            });

            Promise.all(promises).then(results => {
                // console.log(results);

                res.writeHead(200, {
                    'Content-Type': "application/json",
                });

                let response = {
                    results: results,
                    boidArray: data.boidArray
                }

                res.write(JSON.stringify(response));
                res.end();

            })

        });
        return;
    }

    res.writeHead(400, {
        "Content-Type": "text/plain"
    });
    res.end("Not Found");
}

const server = http.createServer(requestHandeler);
server.listen(5001);
console.log("Server Started at 5001");

const getIPOResult = (boid, company) => {
    return axios.post("https://iporesult.cdsc.com.np/result/result/check", {
        boid: boid,
        companyShareId: company
    }).then(response => {
        return response.data
    })
}