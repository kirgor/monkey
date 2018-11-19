const parseGithub = require('./parseGithub')
const params = require('./params')
const authParams = require('./auth')

const combinedParams = {...params, ...authParams}

parseGithub(combinedParams).then(result => {
    const {jiraUrl, githubRepoAccount, githubRepo} = combinedParams

    console.log()

    console.log('Found linked issues:')
    console.log(`${jiraUrl}/issues/?jql=ID%20in%20%28${result.issues.join('%2C')}%29`)

    console.log()

    console.log('Pull requests without linked issues:')
    console.log(result.pullRequestInfos.filter(p => p.issues.length === 0).map(p => `https://github.com/${githubRepoAccount}/${githubRepo}/pull/${p.id} - ${p.title}`))

    console.log()

    console.log('Non-pull requests:')
    console.log(result.nonPullRequestInfos)
})
