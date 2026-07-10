# Script to seed all databases in the workspace
# Run: .\seed-all.ps1

$services = @(
    "unsia-core-service",
    "unsia-reference-service",
    "unsia-crm-service",
    "unsia-pmb-service",
    "unsia-finance-service",
    "unsia-academic-service",
    "unsia-hris-service",
    "unsia-lms-service",
    "unsia-assessment-service"
)

Write-Host "=== Starting Seeders for all Services ===" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "`n> Seeding $service..." -ForegroundColor Yellow
    if (Test-Path $service) {
        Push-Location $service
        try {
            npm run db:seed
            Write-Host "✓ Successfully seeded $service" -ForegroundColor Green
        } catch {
            Write-Error "Failed to seed $service"
        }
        Pop-Location
    } else {
        Write-Warning "Directory $service not found. Skipping."
    }
}

Write-Host "`n=== All Seeding Completed ===" -ForegroundColor Green
