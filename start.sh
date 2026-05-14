#!/bin/bash

echo "Starting Portfolio Application..."
echo "================================"
echo ""
echo "This script will:"
echo "1. Start PostgreSQL database"
echo "2. Start Strapi backend"
echo "3. Start React frontend"
echo ""
echo "Please wait while containers are being built and started..."
echo ""

docker-compose up --build

