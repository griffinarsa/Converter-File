param(
  [Parameter(Mandatory = $true)][ValidateSet('excel', 'powerpoint')][string]$Application,
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][ValidateSet('pdf', 'xlsx')][string]$TargetFormat
)

$ErrorActionPreference = 'Stop'
$app = $null
$document = $null
try {
  if ($Application -eq 'excel') {
    $app = New-Object -ComObject Excel.Application
    $app.Visible = $false
    $app.DisplayAlerts = $false
    $app.AutomationSecurity = 3
    $document = $app.Workbooks.Open($InputPath, 0, $true)
    if (-not $document) { throw 'Excel returned no workbook.' }
    if ($TargetFormat -eq 'pdf') { $document.ExportAsFixedFormat(0, $OutputPath, 0, $false, $true) }
    else { $document.SaveAs($OutputPath, 51) }
    $document.Close($false)
  }
  else {
    if ($TargetFormat -ne 'pdf') { throw 'PowerPoint can only export to PDF through this converter.' }
    $app = New-Object -ComObject PowerPoint.Application
    $app.DisplayAlerts = 1
    $app.AutomationSecurity = 3
    $document = $app.Presentations.Open($InputPath, $true, $false, $false)
    if (-not $document) { throw 'PowerPoint returned no presentation.' }
    $document.SaveAs($OutputPath, 32)
    $document.Close()
  }
}
finally {
  if ($document) {
    try { $document.Close($false) } catch { try { $document.Close() } catch { } }
    try { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($document) } catch { }
  }
  if ($app) {
    try { $app.Quit() } catch { }
    try { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($app) } catch { }
  }
}

if (-not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
  throw "$Application did not create the requested output file."
}
