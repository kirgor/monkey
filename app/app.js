const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const {getConfig, setConfig} = require('./config')
const parseGitLog = require('./parseGitLog')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.redirect('/gitlog')
})

app.use('/gitlog', (req, res) => {
    if (req.body.fromCommit && req.body.toCommit) {
        const config = getConfig()
        parseGitLog({
            ...config,
            fromCommit: req.body.fromCommit,
            toCommit: req.body.toCommit
        }).then(report => {
            res.render('gitlog', {
                title: 'Git log',
                fromCommit: req.body.fromCommit,
                toCommit: req.body.toCommit,
                report: {
                    issues: report.issues,
                    pullRequestInfosWithoutIssues: report.pullRequestInfos.filter(p => p.issues.length === 0),
                    nonPullRequestInfos: report.nonPullRequestInfos
                },
                config
            })
        })
    } else {
        res.render('gitlog', {
            title: 'Git log'
        })
    }
})

app.use('/config', (req, res) => {
    if (req.method === 'POST') {
        setConfig(req.body)
    }

    res.render('config', {
        title: 'Config',
        config: getConfig()
    })
})

const {port} = getConfig()
app.listen(port, () => console.log(`Application started on port ${port}`))