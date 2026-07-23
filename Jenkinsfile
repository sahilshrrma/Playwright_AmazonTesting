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
                sh "docker run --rm -v ${WORKSPACE}/results:/app/results amazon-tests:${BUILD_NUMBER}"
            }
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'results/junit.xml'
        }
        success {
            echo 'All tests passed'
        }
        failure {
            echo 'Some tests failed — check the JUnit report above'
        }
    }
}