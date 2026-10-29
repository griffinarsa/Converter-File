param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][string]$TargetFormat
)

$ErrorActionPreference = 'Stop'
$formatIds = @{ pdf = 17; docx = 16; odt = 23; txt = 2; rtf = 6; html = 10 }
$target = $TargetFormat.ToLowerInvariant()
if (-not $formatIds.ContainsKey($target)) { throw "Unsupported Word output format: $target" }

$word = $null
$document = $null
$stage = 'create Word'
try {
  $word = New-Object -ComObject Word.Application
  $stage = 'configure Word'
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $word.AutomationSecurity = 3
  $stage = "open source file: $InputPath"
  $document = $word.Documents.Open($InputPath, $false, $true, $false)
  if (-not $document) { throw 'Word returned no document when opening the source file.' }
  $stage = "save as $target"
  $document.SaveAs2($OutputPath, $formatIds[$target])
  $document.Close($false)
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($document)
  $document = $null
}
catch {
  throw "Word failed to $stage. $($_.Exception.Message)"
}
finally {
  if ($document) {
    try { $document.Close($false) } catch { }
    try { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($document) } catch { }
  }
  if ($word) {
    try { $word.Quit() } catch { }
    try { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) } catch { }
  }
}

if (-not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
  throw "Word did not create the requested output file."
}
