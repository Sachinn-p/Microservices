#!/bin/bash

# Array of services and their respective local ports
declare -A services=(
    ["catalog-service"]="3001"
    ["order-service"]="3002"
    ["rating-service"]="3003"
    ["notification-service"]="3004"
)

echo "Generating .env files from .env.example..."

if [ ! -f .env.example ]; then
    echo "Error: .env.example not found in the current directory!"
    exit 1
fi

for service in "${!services[@]}"; do
    port="${services[$service]}"
    db_name="${service%-service}" # removes '-service' from the end
    
    echo "Creating .env for $service..."
    
    # Create the .env file for the specific service by replacing placeholders
    sed -e "s|SERVICE_NAME_db|${db_name}_db|g" \
        -e "s|PORT=3000|PORT=${port}|g" \
        .env.example > "$service/.env"
        
    echo "  -> Created $service/.env"
done

echo "Done! All .env files have been generated."
