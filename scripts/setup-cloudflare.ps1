# Cloudflare Wrangler setup for Gurmaio (Windows PowerShell)
# - Prompts for a Cloudflare API Token
# - Saves it permanently as a *User* environment variable: CLOUDFLARE_API_TOKEN
# - Verifies auth via `wrangler whoami`
# - Guides you through setting Worker secrets and deploying
#
# Notes:
# - Do NOT paste tokens into chat or commit them into git.
# - This script does not print your token.

$ErrorActionPreference = 'Stop'

param(
  [switch]$RemoteOnly
)

# Reduce interactive prompts from Wrangler where possible
$env:CI = 'true'
$env:WRANGLER_SEND_METRICS = 'false'

function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $name. Install it and retry."
  }
}

function Read-SecretPlainText([string]$prompt) {
  $secure = Read-Host $prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

Write-Host "\n== Gurmaio: Cloudflare setup ==\n" -ForegroundColor Cyan

if ($RemoteOnly) {
  Write-Host "Remote-only mode selected." -ForegroundColor Green
  Write-Host "Use Vercel (frontend) + Cloudflare Workers Deploy-from-Git (backend) instead of local deploy." -ForegroundColor Green
  Write-Host "See: REMOTE_CLOUD_SETUP.md" -ForegroundColor Cyan
  return
}

Require-Command "wrangler"

# 1) Ensure we have an API token available
$token = $env:CLOUDFLARE_API_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
  # If it was previously saved permanently, load it into this process.
  $persisted = [Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN', 'User')
  if (-not [string]::IsNullOrWhiteSpace($persisted)) {
    $env:CLOUDFLARE_API_TOKEN = $persisted
    $token = $persisted
    Write-Host "Loaded CLOUDFLARE_API_TOKEN from User environment variables into this session." -ForegroundColor Green
  }
}

if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Host "CLOUDFLARE_API_TOKEN is not set." -ForegroundColor Yellow
  Write-Host "Paste your Cloudflare API Token when prompted. It will be saved permanently for your Windows user." -ForegroundColor Yellow
  $token = Read-SecretPlainText "Cloudflare API Token"

  if ([string]::IsNullOrWhiteSpace($token)) {
    throw "Token was empty. Aborting."
  }

  # Set for current process + persist for current Windows user
  $env:CLOUDFLARE_API_TOKEN = $token
  [Environment]::SetEnvironmentVariable('CLOUDFLARE_API_TOKEN', $token, 'User')

  Write-Host "Saved CLOUDFLARE_API_TOKEN to User environment variables." -ForegroundColor Green
  Write-Host "Tip: restart VS Code terminals if needed." -ForegroundColor DarkGray
} else {
  Write-Host "CLOUDFLARE_API_TOKEN is already set in this session." -ForegroundColor Green
}

# 2) Verify auth
Write-Host "\nVerifying Cloudflare auth..." -ForegroundColor Cyan
$whoamiOutput = & wrangler whoami 2>&1
$whoamiExit = $LASTEXITCODE
$whoamiOutput | Out-Host

if ($whoamiExit -ne 0 -or ($whoamiOutput | Out-String) -match 'not authenticated') {
  Write-Host "\nWrangler is not authenticated yet." -ForegroundColor Red
  Write-Host "- Ensure your Cloudflare API Token is valid and has Workers permissions." -ForegroundColor Yellow
  Write-Host "- Ensure CLOUDFLARE_API_TOKEN is available in this terminal session." -ForegroundColor Yellow
  Write-Host "\nTo load the saved token into the current session (without printing it):" -ForegroundColor Cyan
  Write-Host "  `$env:CLOUDFLARE_API_TOKEN = [Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN','User')" -ForegroundColor Gray
  throw "Aborting before setting secrets/deploy because authentication failed."
}

# 3) Set Worker secrets interactively (recommended)
$repoRoot = Split-Path -Parent $PSScriptRoot
$workerDir = Join-Path $repoRoot "packages\gurmaio-workers"

if (-not (Test-Path $workerDir)) {
  throw "Worker directory not found: $workerDir"
}

Push-Location $workerDir
try {
  Write-Host "\n== Next: set Worker secrets ==" -ForegroundColor Cyan
  Write-Host "You will be prompted to paste values in the terminal. Nothing is saved to git." -ForegroundColor DarkGray

  Write-Host "\n1) SUPABASE_URL" -ForegroundColor Yellow
  wrangler secret put SUPABASE_URL

  Write-Host "\n2) SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
  wrangler secret put SUPABASE_SERVICE_ROLE_KEY

  Write-Host "\nOptional) ALLOWED_ORIGINS (recommended for prod; example: https://your-vercel-app.vercel.app)" -ForegroundColor Yellow
  $setAllowed = Read-Host "Set ALLOWED_ORIGINS now? (y/N)"
  if ($setAllowed -match '^(y|yes)$') {
    wrangler secret put ALLOWED_ORIGINS
  }

  # 4) Deploy
  Write-Host "\n== Deploying Worker ==" -ForegroundColor Cyan
  wrangler deploy

  Write-Host "\nDone." -ForegroundColor Green
  Write-Host "Copy the Worker URL from the output and set it in Vercel as VITE_WORKERS_API_URL." -ForegroundColor Green
} finally {
  Pop-Location
}
