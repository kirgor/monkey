const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const githubReport = require('./githubReport')

let config
try {
    config = require('./config')
} catch (e) {
    console.error('Cannot load GitHub Report profiles. Make sure you have "config.js" file.')
    process.exit(1)
}

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.redirect('/githubReport')
})

app.use('/githubReport', async (req, res) => {
    if (req.body.reportProfileKey && req.body.fromCommit && req.body.toCommit) {
        try {
            const reportProfile = config.githubReportProfiles[req.body.reportProfileKey]

            const report = await githubReport({
                ...reportProfile,
                reportProfileKey: req.body.reportProfileKey,
                fromCommit: req.body.fromCommit,
                toCommit: req.body.toCommit,
            })

            res.render('githubReport', {
                title: 'GitHub Report',
                reportProfileKeys: Object.keys(config.githubReportProfiles),
                reportProfileKey: req.body.reportProfileKey,
                fromCommit: req.body.fromCommit,
                toCommit: req.body.toCommit,
                report,
                reportProfile,
            })
        } catch (error) {
            res.render('githubReport', {
                title: 'GitHub Report',
                reportProfileKeys: Object.keys(config.githubReportProfiles),
                error,
            })
        }
    } else {
        res.render('githubReport', {
            title: 'GitHub Report',
            reportProfileKeys: Object.keys(config.githubReportProfiles),
        })
    }
})

app.listen(config.port, () => console.log(`Application started on port ${config.port}`))
