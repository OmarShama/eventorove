#!/bin/bash

# DigitalOcean Ubuntu Server Setup Script
# Run this on your new server

echo "🚀 Setting up your server for Eventorove..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install other useful tools
sudo apt install -y git curl wget nano htop

# Create app directory
mkdir -p ~/eventorove
cd ~/eventorove

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Upload your project files to this server"
echo "2. Configure your environment files"
echo "3. Run the deployment script"
echo ""
echo "Your server is ready! 🎉"
