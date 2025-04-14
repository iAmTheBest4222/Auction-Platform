pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry' // Replace with your registry
        DOCKER_IMAGE = 'auction-platform'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CI = 'false' // Disable CI mode to prevent ESLint warnings from failing the build
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Check Docker Installation') {
            steps {
                script {
                    try {
                        def dockerVersion = bat(script: 'docker --version', returnStdout: true).trim()
                        echo "Docker version: ${dockerVersion}"
                    } catch (Exception e) {
                        error "Docker is not installed or not in PATH. Please ensure Docker Desktop is installed and running."
                    }
                    
                    try {
                        def composeVersion = bat(script: 'docker-compose --version', returnStdout: true).trim()
                        echo "Docker Compose version: ${composeVersion}"
                    } catch (Exception e) {
                        error "Docker Compose is not installed or not in PATH. Please ensure Docker Desktop is installed and running."
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('.') {
                    bat 'npm install'
                    bat 'set CI=false && npm run build'
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
                script {
                    try {
                        bat 'docker-compose build'
                    } catch (Exception e) {
                        error "Failed to build Docker images. Please check if Docker Desktop is running and accessible."
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                dir('.') {
                    bat 'set CI=false && npm test'
                }
                dir('server') {
                    bat 'npm test'
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    try {
                        bat """
                            docker tag ${DOCKER_IMAGE}_frontend:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_frontend:${DOCKER_TAG}
                            docker tag ${DOCKER_IMAGE}_backend:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_backend:${DOCKER_TAG}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_frontend:${DOCKER_TAG}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}_backend:${DOCKER_TAG}
                        """
                    } catch (Exception e) {
                        error "Failed to push Docker images. Please check Docker registry configuration."
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    try {
                        bat 'docker-compose up -d'
                    } catch (Exception e) {
                        error "Failed to deploy containers. Please check Docker configuration."
                    }
                }
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
            echo 'Pipeline failed! Check the logs for detailed error messages.'
        }
    }
} 