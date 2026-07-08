pipeline {
    agent {
        docker { image 'mcr.microsoft.com/playwright:v1.48.0-jammy' }
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/sahilshrrma/Playwright_AmazonTesting.git', branch: 'main'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
        stage('Publish Report') {
            steps {
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Report'
                ])
            }
        }
    }
}