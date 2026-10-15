@echo off
rem Atualiza a prévia do Instagram do site do Fosco (agendado no Windows, uma vez por dia).
cd /d C:\Users\gabri\FoscoTattoo
echo [%date% %time%] >> _originais\instagram-robo.log
node scripts\instagram.cjs foscotattoo >> _originais\instagram-robo.log 2>&1
