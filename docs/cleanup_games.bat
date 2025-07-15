@echo off
echo Mini Roulette Game Cleanup Script
echo =================================
echo.
echo This script will remove unused game directories, keeping only the mini roulette game and its dependencies.
echo.
echo Directories to be removed:
echo - baccarat
echo - bau-cua-mini
echo - bigsmall
echo - bitcoin-master
echo - blackjack
echo - cascading-slot
echo - dragon-tiger
echo - gateway-baccarat
echo - hi-lo
echo - holdem-poker
echo - keno-pro
echo - lottery
echo - lucky-wheel
echo - mini-keno
echo - muliplay-mini-sedie
echo - multiplay
echo - multiplay-bigsmall
echo - multiplay-keno
echo - sedie
echo - sicbo
echo - special-sedie
echo - texas-holdem-poker
echo - three-cards
echo - turbo-bigsmall
echo - turbo-oddeven
echo - vip-baccarat
echo - vip-fish-prawn-crab
echo - vip-sedie
echo - vip-sedie-war
echo.
set /p confirm="Do you want to proceed? (y/N): "
if /i "%confirm%"=="y" (
    echo.
    echo Removing unused game directories...
    echo.
    
    cd assets\games
    
    echo Removing game directories...
    rmdir /s /q baccarat 2>nul
    rmdir /s /q bau-cua-mini 2>nul
    rmdir /s /q bigsmall 2>nul
    rmdir /s /q bitcoin-master 2>nul
    rmdir /s /q blackjack 2>nul
    rmdir /s /q cascading-slot 2>nul
    rmdir /s /q dragon-tiger 2>nul
    rmdir /s /q gateway-baccarat 2>nul
    rmdir /s /q hi-lo 2>nul
    rmdir /s /q holdem-poker 2>nul
    rmdir /s /q keno-pro 2>nul
    rmdir /s /q lottery 2>nul
    rmdir /s /q lucky-wheel 2>nul
    rmdir /s /q mini-keno 2>nul
    rmdir /s /q muliplay-mini-sedie 2>nul
    rmdir /s /q multiplay 2>nul
    rmdir /s /q multiplay-bigsmall 2>nul
    rmdir /s /q multiplay-keno 2>nul
    rmdir /s /q sedie 2>nul
    rmdir /s /q sicbo 2>nul
    rmdir /s /q special-sedie 2>nul
    rmdir /s /q texas-holdem-poker 2>nul
    rmdir /s /q three-cards 2>nul
    rmdir /s /q turbo-bigsmall 2>nul
    rmdir /s /q turbo-oddeven 2>nul
    rmdir /s /q vip-baccarat 2>nul
    rmdir /s /q vip-fish-prawn-crab 2>nul
    rmdir /s /q vip-sedie 2>nul
    rmdir /s /q vip-sedie-war 2>nul
    
    echo.
    echo Removing meta files...
    del baccarat.meta 2>nul
    del bau-cua-mini.meta 2>nul
    del bigsmall.meta 2>nul
    del bitcoin-master.meta 2>nul
    del blackjack.meta 2>nul
    del cascading-slot.meta 2>nul
    del dragon-tiger.meta 2>nul
    del gateway-baccarat.meta 2>nul
    del hi-lo.meta 2>nul
    del holdem-poker.meta 2>nul
    del keno-pro.meta 2>nul
    del lottery.meta 2>nul
    del lucky-wheel.meta 2>nul
    del mini-keno.meta 2>nul
    del muliplay-mini-sedie.meta 2>nul
    del multiplay.meta 2>nul
    del multiplay-bigsmall.meta 2>nul
    del multiplay-keno.meta 2>nul
    del sedie.meta 2>nul
    del sicbo.meta 2>nul
    del special-sedie.meta 2>nul
    del texas-holdem-poker.meta 2>nul
    del three-cards.meta 2>nul
    del turbo-bigsmall.meta 2>nul
    del turbo-oddeven.meta 2>nul
    del vip-baccarat.meta 2>nul
    del vip-fish-prawn-crab.meta 2>nul
    del vip-sedie.meta 2>nul
    del vip-sedie-war.meta 2>nul
    
    cd ..\..
    
    echo.
    echo Cleanup completed!
    echo.
    echo Remaining directories:
    dir assets\games /b /ad
    echo.
    echo Please test the mini roulette game to ensure it still works correctly.
) else (
    echo Cleanup cancelled.
)
echo.
pause 