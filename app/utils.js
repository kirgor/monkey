const https = require('https')

function parseJiraLikeIds(projectIds, text) {
    return text.match(new RegExp(`(${projectIds.join('|')})-[0-9]+`, 'g')) || []
}

function fetchJson({
    hostname,
    path,
    auth,
}) {
    return new Promise(((resolve, reject) => {
        https.get({
            hostname,
            path,
            method: 'GET',
            headers: {
                'User-Agent': 'Team Lead Helper 1.0.0',
            },
            auth,
            rejectUnauthorized: false,
        }, res => {
            let data = ''
            res.on('data', chunk => data += chunk.toString())
            res.on('end', () => resolve(JSON.parse(data)))
        }).on('error', e => reject(e))
    }))
}

module.exports = {
    parseJiraLikeIds,
    fetchJson,
}
