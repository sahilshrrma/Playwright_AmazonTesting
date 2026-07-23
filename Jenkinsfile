pipeline {
    agent any
    stages {
        stage('Build test image') {
            steps {
                sh "docker build -f Dockerfile.playwright -t amazon-tests:${BUILD_NUMBER} ."
            }
        }
        stage('Run tests') {
            steps {
                sh "docker run --rm -v ${WORKSPACE}/allure-results:/app/allure-results amazon-tests:${BUILD_NUMBER}"
            }
        }
    }
    post {
        always {
            allure includeProperties: false, jdk: '', commandline: 'allure', results: [[path: 'allure-results']]
        }
        success {
            echo 'All tests passed'
        }
        failure {
            echo 'Some tests failed — check the Allure report above'
        }
    }
}