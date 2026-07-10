#!/bin/bash

# Array of service directories
services=(
  "unsia-core-service"
  "unsia-reference-service"
  "unsia-crm-service"
  "unsia-pmb-service"
  "unsia-finance-service"
  "unsia-academic-service"
  "unsia-hris-service"
  "unsia-lms-service"
  "unsia-assessment-service"
)

echo "=== Starting Seeders for all Services ==="

for service in "${services[@]}"
do
  echo ""
  echo "> Seeding $service..."
  if [ -d "$service" ]; then
    cd "$service" || exit
    if npm run db:seed; then
      echo "✓ Successfully seeded $service"
    else
      echo "✗ Failed to seed $service"
    fi
    cd ..
  else
    echo "⚠ Directory $service not found. Skipping."
  fi
done

echo ""
echo "=== All Seeding Completed ==="
