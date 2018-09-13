const parseGithub = require('./parseGithub')
const params = require('./params')

parseGithub(params).then(result => {
    const {jiraUrl, githubRepoAccount, githubRepo} = params

    console.log()

    console.log('Found linked issues:')
    console.log(`${jiraUrl}/issues/?jql=ID%20in%20%28${result.issues.join('%2C')}%29`)

    console.log()

    console.log('Pull requests without linked issues:')
    console.log(result.pullRequestInfos.filter(p => p.issues.length === 0).map(p => `https://github.com/${githubRepoAccount}/${githubRepo}/pull/${p.id} - ${p.title}`))
})
