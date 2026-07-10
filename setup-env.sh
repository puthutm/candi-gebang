#!/bin/bash

# Configuration
IP_ADDR="10.10.20.56"

echo "=== Generating .env files for all repositories using IP: $IP_ADDR ==="

# 1. Core Service
echo "Writing unsia-core-service/.env..."
cat << EOF > unsia-core-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5431/core_db
JWT_SECRET=supersecretkeyforlocaldevchangeinprod
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=supersecretrefreshkeychangeinprod
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
EOF

# 2. Reference Service
echo "Writing unsia-reference-service/.env..."
cat << EOF > unsia-reference-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5432/reference_db
CORE_SERVICE_URL=http://$IP_ADDR:3001
PORT=3002
EOF

# 3. CRM Service
echo "Writing unsia-crm-service/.env..."
cat << EOF > unsia-crm-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5433/crm_db
PORT=3003
PMB_SERVICE_URL=http://$IP_ADDR:3004
EOF

# 4. PMB Service
echo "Writing unsia-pmb-service/.env..."
cat << EOF > unsia-pmb-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5434/pmb_db
PORT=3004
FINANCE_SERVICE_URL=http://$IP_ADDR:3005
ACADEMIC_SERVICE_URL=http://$IP_ADDR:3006
EOF

# 5. Finance Service
echo "Writing unsia-finance-service/.env..."
cat << EOF > unsia-finance-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5435/finance_db
PORT=3005
EOF

# 6. Academic Service
echo "Writing unsia-academic-service/.env..."
cat << EOF > unsia-academic-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5436/academic_db
PORT=3006
FINANCE_SERVICE_URL=http://$IP_ADDR:3005
LMS_SERVICE_URL=http://$IP_ADDR:3008
EOF

# 7. HRIS Service
echo "Writing unsia-hris-service/.env..."
cat << EOF > unsia-hris-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5437/hris_db
PORT=3007
EOF

# 8. LMS Service
echo "Writing unsia-lms-service/.env..."
cat << EOF > unsia-lms-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5438/lms_db
PORT=3008
EOF

# 9. Assessment Service
echo "Writing unsia-assessment-service/.env..."
cat << EOF > unsia-assessment-service/.env
DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5439/assessment_db
PORT=3009
ACADEMIC_SERVICE_URL=http://$IP_ADDR:3006
EOF

# 10. Integration Worker
echo "Writing unsia-integration-worker/.env..."
cat << EOF > unsia-integration-worker/.env
RABBITMQ_URL=amqp://guest:guest@$IP_ADDR:5672
CORE_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5431/core_db
REFERENCE_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5432/reference_db
CRM_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5433/crm_db
PMB_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5434/pmb_db
FINANCE_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5435/finance_db
ACADEMIC_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5436/academic_db
HRIS_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5437/hris_db
LMS_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5438/lms_db
ASSESSMENT_DATABASE_URL=postgresql://postgres:postgrespassword@$IP_ADDR:5439/assessment_db
EOF

echo "=== All .env files created successfully ==="
