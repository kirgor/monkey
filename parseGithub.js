const https = require('https')
const {spawnSync} = require('child_process')

function parseGithub({
    localRepoPath,
    jiraProject,
    githubRepoAccount,
    githubRepo,
    fromCommit,
    toCommit,
    auth
}) {
    return new Promise(resolve => {
        const gitLogProcess = spawnSync(`git log ${fromCommit}..${toCommit} --oneline --first-parent`, {
            shell: true,
            cwd: localRepoPath
        })

        let issues = {}
        let pullRequestInfos = []
        let nonPullRequestInfos = []
        let processedCount = 0

        const regexp = /Merge pull request \#([0-9]+).*/
        const pulls = []
        gitLogProcess.stdout.toString().split('\n').forEach(line => {
            const match = regexp.exec(line)
            if (match) {
                pulls.push(parseInt(match[1]))
            } else if (line) {
                nonPullRequestInfos.push(line)
            }
        })

        pulls.forEach(pull => {
            https.get({
                hostname: 'api.github.com',
                path: `/repos/${githubRepoAccount}/${githubRepo}/pulls/${pull}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'Jira Helper 1.0.0'
                },
                auth
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk.toString()
                })
                res.on('end', () => {
                    const json = JSON.parse(data)
                    const pullRequestInfo = {
                        id: pull,
                        title: json['title'],
                        body: json['body'],
                        issues: [],
                        fullJson: json
                    }
                    pullRequestInfos.push(pullRequestInfo)

                    const body = json['body']
                    const match = body.match(new RegExp(`${jiraProject}-[0-9]+`, 'g'))

                    if (match) {
                        match.forEach(m => issues[m] = true)
                        pullRequestInfo.issues = match
                    }

                    processedCount++
                    if (processedCount === pulls.length) {
                        resolve({
                            pullRequestInfos,
                            nonPullRequestInfos,
                            issues: Object.keys(issues)
                        })
                    }
                })
            })
        })
    })
}

module.exports = parseGithub