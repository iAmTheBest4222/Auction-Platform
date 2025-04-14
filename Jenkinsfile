pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry'
        DOCKER_IMAGE = 'auction-platform'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CI = 'false'
        DISABLE_ESLINT_PLUGIN = 'true'
        SKIP_PREFLIGHT_CHECK = 'true'
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat 'npm install --legacy-peer-deps'
                dir('server') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                bat 'set CI=false && npm run build'
            }
        }
        
        stage('Run Tests') {
            steps {
                bat 'npm test -- --passWithNoTests'
                dir('server') {
                    bat 'npm test -- --passWithNoTests'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    bat 'docker-compose build'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    bat 'docker-compose up -d'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}