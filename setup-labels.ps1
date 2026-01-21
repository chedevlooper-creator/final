# GitHub Actions Workflow Kurulum Script
# Bu script gerekli label'ları oluşturur

Write-Host "🏷️  GitHub Labels oluşturuluyor..." -ForegroundColor Cyan

# Repository kontrolü
$gitRemote = git remote get-url origin
if (-not $gitRemote) {
    Write-Host "❌ Bu bir git repository değil!" -ForegroundColor Red
    exit 1
}

Write-Host "Repository: $gitRemote" -ForegroundColor Green

# GitHub CLI kontrolü
$ghVersion = gh --version
if (-not $ghVersion) {
    Write-Host "❌ GitHub CLI (gh) kurulu değil!" -ForegroundColor Red
    Write-Host "Kurulum: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI bulundu" -ForegroundColor Green
Write-Host ""

# Label'ları oluştur
$labels = @(
    @{name="auto-fixed"; color="0E8A16"; description="Automatically fixed by bot"},
    @{name="dependencies"; color="0366D6"; description="Dependency updates"},
    @{name="security"; color="D73A4A"; description="Security related"},
    @{name="automated"; color="FBCA04"; description="Automated PR"},
    @{name="critical"; color="B60205"; description="Critical issue"}
)

foreach ($label in $labels) {
    Write-Host "Creating label: $($label.name)..." -ForegroundColor Cyan
    
    gh label create $label.name `
        --color $label.color `
        --description $label.description `
        --force 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $($label.name) oluşturuldu" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($label.name) zaten mevcut veya oluşturulamadı" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Label'lar başarıyla oluşturuldu!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Oluşturulan label'lar:" -ForegroundColor Cyan
gh label list | Select-String "auto-fixed|dependencies|security|automated|critical"
