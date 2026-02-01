#!/bin/bash

# setup_docker.sh
# Script to install Docker and deploy PETRODIESEL2 on a fresh Linux server (Ubuntu/Debian)

echo ">>> Starting PETRODIESEL2 Deployment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Update Packages
echo ">>> Updating package lists..."
sudo apt-get update

# 2. Install Docker if not installed
if command_exists docker; then
    echo ">>> Docker is already installed."
else
    echo ">>> Docker not found. Installing Docker..."
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Enable Docker service
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # Add current user to docker group (requires re-login to check, so we use sudo for now)
    sudo usermod -aG docker $USER
    echo ">>> Docker installed successfully."
fi

# 3. Check for .env file
if [ ! -f .env ]; then
    echo ">>> WARNING: .env file not found!"
    echo ">>> Please create a .env file with your database credentials before running."
    echo ">>> Example .env content:"
    echo "DB_USERNAME=petro_user"
    echo "DB_PASSWORD=secret_password"
    echo "DB_DATABASE=petrodiesel_db"
    echo "DB_ROOT_PASSWORD=root_secret"
    exit 1
fi

# 4. Build and Run Containers
echo ">>> Building and starting containers..."
sudo docker compose up -d --build

# 5. Show Status
echo ">>> Deployment complete! Checking status..."
sudo docker compose ps

echo ">>> App should be running on http://$(curl -s ifconfig.me):8080"
