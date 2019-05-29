@echo off

IF NOT EXIST %AppData%\Zelcash (
    mkdir %AppData%\Zelcash
)

IF NOT EXIST %AppData%\ZcashParams (
    mkdir %AppData%\ZcashParams
)

IF NOT EXIST %AppData%\Zelcash\zelcash.conf (
   (
    echo addnode=explorer.zel.cash
    echo rpcuser=username 
    echo rpcpassword=password%random%%random%
    echo daemon=1 
    echo showmetrics=0 
    echo gen=0 
) > %AppData%\Zelcash\zelcash.conf
) 
