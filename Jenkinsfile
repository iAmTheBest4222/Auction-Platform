pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry' // Replace with your registry
        DOCKER_IMAGE = 'auction-platform'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('.') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('server') {
                    bat 'npm install'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                bat 'docker-compose build'
            }
        }
        
        stage('Run Tests') {
            steps {
                dir('.') {
                    bat 'npm test'
                }
                dir('server') {
                    bat 'npm test'
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                bat """
                    docker tag ${DOCKER_IMAGE}_frontend:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_frontend:${DOCKER_TAG}
                    docker tag ${DOCKER_IMAGE}_backend:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_backend:${DOCKER_TAG}
                    docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_frontend:${DOCKER_TAG}
                    docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_backend:${DOCKER_TAG}
                """
            }
        }
        
        stage('Deploy') {
            steps {
                bat 'docker-compose up -d'
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 