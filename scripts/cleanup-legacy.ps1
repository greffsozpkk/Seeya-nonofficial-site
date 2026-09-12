param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\','/')
$prefix = $projectRoot + [IO.Path]::DirectorySeparatorChar
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'legacy-files.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'VERSION') -Raw).Trim()
if ($version -ne $manifest.version) { throw 'Wrong project version. Install the complete update before cleanup.' }
if (!(Test-Path -LiteralPath (Join-Path $projectRoot 'build.js'))) { throw 'Not a SEEYA project root.' }
$archive = Get-Content -LiteralPath (Join-Path $projectRoot 'data/archive.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($archive.Count -lt $manifest.minimumArchiveRecords) { throw 'Consolidated archive is missing. No files removed.' }
$ids = @($archive | ForEach-Object { $_.id } | Sort-Object -Unique)
if ($ids.Count -ne $archive.Count) { throw 'Duplicate archive IDs. No files removed.' }
if (!($ids -contains 'v488-audit-048')) { throw 'The final v4.88 archive record is missing. No files removed.' }
$candidates = @()
$skipped = @()
foreach ($entry in $manifest.files) {
    $target = [IO.Path]::GetFullPath((Join-Path $projectRoot $entry.path))
    if (!$target.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)) { throw 'Cleanup path is outside the project.' }
    if (!(Test-Path -LiteralPath $target)) { continue }
    $item = Get-Item -LiteralPath $target -Force
    if ($item.PSIsContainer) { throw "Expected a regular file: $target" }
    $walk = $item
    while ($walk -and $walk.FullName -ne $projectRoot) {
        if ($walk.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Refusing linked path: $target" }
        $walk = if ($walk -is [IO.DirectoryInfo]) { $walk.Parent } else { $walk.Directory }
    }
    $text = [IO.File]::ReadAllText($target).TrimStart([char]0xFEFF).Replace("`r`n","`n").Replace("`r","`n")
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $hash = ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($text)))).Replace('-','').ToLowerInvariant() }
    finally { $sha.Dispose() }
    if ($hash -ne $entry.sha256) { $skipped += $entry.path; Write-Host "SKIP changed: $($entry.path)"; continue }
    $candidates += [PSCustomObject]@{ path=$entry.path; absolute=$target }
}
if (!$Apply) { $candidates | ForEach-Object { Write-Host "Would remove: $($_.path)" }; Write-Host 'Preview only. Run cleanup-legacy.bat to apply.'; exit 0 }
if ($candidates.Count -eq 0) { Write-Host 'No unchanged legacy files remain.'; exit 0 }
$backupRoot = Join-Path ([IO.Path]::GetTempPath()) 'SEEYA-backups'
$stamp = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
$backupPath = Join-Path $backupRoot ("before-v490-" + $stamp + '.zip')
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open($backupPath,[IO.Compression.ZipArchiveMode]::Create)
try { foreach ($entry in $candidates) { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$entry.absolute,$entry.path,[IO.Compression.CompressionLevel]::Optimal) | Out-Null } }
finally { $zip.Dispose() }
$check = [IO.Compression.ZipFile]::OpenRead($backupPath)
try { if ($check.Entries.Count -ne $candidates.Count) { throw 'Backup is incomplete. No files removed.' } }
finally { $check.Dispose() }
foreach ($entry in $candidates) { Remove-Item -LiteralPath $entry.absolute; Write-Host "Removed: $($entry.path)" }
Write-Host "Backup: $backupPath"
Write-Host "Done. Removed $($candidates.Count) files; skipped $($skipped.Count) edited files. Commit these deletions together with the update."
