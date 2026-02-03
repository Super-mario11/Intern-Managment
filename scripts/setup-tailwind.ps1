# PowerShell helper to install Tailwind v3 and initialize config
Write-Host "Running Tailwind setup (PowerShell)..."
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
# move to project root
Set-Location ..
npm install
npm install -D tailwindcss@^3.4.7 postcss autoprefixer
npx tailwindcss init -p
Write-Host "Tailwind setup complete. Run 'npm run dev' or 'npm start' to start the dev server."