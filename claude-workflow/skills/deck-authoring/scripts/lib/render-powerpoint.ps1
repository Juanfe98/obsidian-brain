param([Parameter(Mandatory=$true)][string]$InputPath,
      [Parameter(Mandatory=$true)][string]$OutputPath)
$ErrorActionPreference = 'Stop'
$deckApplication = $null
$deckPresentation = $null
try {
    $deckApplication = New-Object -ComObject PowerPoint.Application
    $deckPresentation = $deckApplication.Presentations.Open($InputPath, $true, $false, $false)
    $deckPresentation.SaveAs($OutputPath, 32)
    Write-Output ('PowerPoint ' + $deckApplication.Version)
} finally {
    if ($null -ne $deckPresentation) {
        $deckPresentation.Close()
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($deckPresentation)
    }
    # PowerPoint may share its application instance with the user. Close only
    # the presentation owned by this invocation, never the user's other decks.
    if ($null -ne $deckApplication) {
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($deckApplication)
    }
}
