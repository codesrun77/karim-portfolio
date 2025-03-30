# First, ensure the file doesn't exist or is empty
if (Test-Path "public/karim-contact.vcf") {
    Remove-Item "public/karim-contact.vcf" -Force
}

# Create a new file with individual lines
$filePath = "public/karim-contact.vcf"
Add-Content -Path $filePath -Value "BEGIN:VCARD" -Encoding UTF8
Add-Content -Path $filePath -Value "VERSION:3.0" -Encoding UTF8
Add-Content -Path $filePath -Value "N:Al Sayed;Karim;;;" -Encoding UTF8
Add-Content -Path $filePath -Value "FN:Karim Al Sayed" -Encoding UTF8
Add-Content -Path $filePath -Value "TITLE:Professional Sound Engineer" -Encoding UTF8
Add-Content -Path $filePath -Value "TEL;TYPE=CELL:+971 50 123 4567" -Encoding UTF8
Add-Content -Path $filePath -Value "EMAIL:info@karimsound.com" -Encoding UTF8
Add-Content -Path $filePath -Value "ADR:;;Dubai;;;United Arab Emirates" -Encoding UTF8
Add-Content -Path $filePath -Value "URL:https://karimsound.com" -Encoding UTF8
Add-Content -Path $filePath -Value "END:VCARD" -Encoding UTF8

Write-Host "VCF file created successfully at $filePath"
Get-Content $filePath | Write-Host 