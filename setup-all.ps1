# Skrip Inisialisasi Otomatis SIAKAD UNSIA
# Jalankan dari root workspace menggunakan PowerShell:
# .\setup-all.ps1

$ErrorActionPreference = "Stop"

$services = @(
    "unsia-shared-contracts",
    "unsia-core-service",
    "unsia-reference-service",
    "unsia-crm-service",
    "unsia-pmb-service",
    "unsia-finance-service",
    "unsia-academic-service",
    "unsia-hris-service",
    "unsia-lms-service",
    "unsia-assessment-service",
    "unsia-integration-worker",
    "unsia-portal-web"
)

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   🚀 MEMULAI SETUP OTOMATIS SIAKAD UNSIA LOCAL HOST  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Pastikan Docker untuk DB/Message Broker menyala
Write-Host "`n[1/3] Memeriksa status infrastruktur Docker..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    Write-Host "Menyalakan PostgreSQL, Redis, dan RabbitMQ di Docker..." -ForegroundColor Gray
    docker-compose up -d
    Write-Host "✔ Infrastruktur Docker aktif!" -ForegroundColor Green
} else {
    Write-Warning "File docker-compose.yml tidak ditemukan di root. Pastikan Docker DB Anda sudah aktif secara manual."
}

# 2. Loop install & database setup
Write-Host "`n[2/3] Menginstall & inisialisasi modul database..." -ForegroundColor Yellow

foreach ($service in $services) {
    Write-Host "`n----------------------------------------" -ForegroundColor Gray
    Write-Host "👉 Memproses: $service" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    if (Test-Path $service) {
        Push-Location $service
        
        Write-Host "• Menginstall dependencies..." -ForegroundColor Gray
        npm install
        
        if ($service -eq "unsia-shared-contracts") {
            Write-Host "• Membangun shared contracts..." -ForegroundColor Gray
            npm run build
        }
        
        # Jalankan db migrations & seed hanya untuk folder service (kecuali shared & worker)
        if ($service -like "*-service" -and $service -ne "unsia-shared-contracts") {
            Write-Host "• Generate schema..." -ForegroundColor Gray
            npm run db:generate
            Write-Host "• Push schema ke database..." -ForegroundColor Gray
            npm run db:push
            Write-Host "• Seeding data awal..." -ForegroundColor Gray
            npm run db:seed
        }
        
        Pop-Location
        Write-Host "✔ Selesai memproses $service!" -ForegroundColor Green
    } else {
        Write-Warning "Folder $service tidak ditemukan, dilewati."
    }
}

Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host " 🎉 SETUP SELESAI! Semua service siap dijalankan." -ForegroundColor Green
Write-Host " Silakan jalankan 'npm run dev' di folder masing-masing." -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
