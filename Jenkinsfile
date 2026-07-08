pipeline {
    agent {
        docker { image 'jenkins/agent:latest-alpine-jdk21' }
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
                sh 'npx playwright install --with-deps'
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
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Report'
                ])
            }
        }
    }
}