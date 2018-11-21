const fs = require('fs')
const path = require('path')

const defaultConfig = {
    port: 3000,
    jiraUrl: '',
    localRepoPath: '',
    jiraProject: '',
    githubRepoAccount: '',
    githubRepo: '',
}

let config = loadConfig()

function getConfig() {
    return {...defaultConfig, ...config}
}

function setConfig(newConfig) {
    config = newConfig
    saveConfig(config)
}

function loadConfig() {
    let config = {}

    const configPath = path.join(__dirname, 'config.json')
    if (fs.existsSync(configPath)) {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        } catch (e) {
            console.error(e)
        }
    }

    return config
}

function saveConfig(config) {
    const configPath = path.join(__dirname, 'config.json')
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8')
}

module.exports = {
    getConfig,
    setConfig
}