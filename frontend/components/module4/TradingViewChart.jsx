import { useEffect, useRef } from 'react'

function TradingViewChart() {
    const containerRef = useRef(null)

    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

        const config = {
            "allow_symbol_change": false,
            "calendar": false,
            "details": false,
            "hide_side_toolbar": true,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "hide_volume": true,
            "hotlist": false,
            "interval": "D",
            "locale": "en",
            "save_image": false,
            "style": "1",
            "symbol": "FX:USDINR",
            "theme": "dark",
            "timezone": "Asia/Kolkata",
            "backgroundColor": "#000000",
            "gridColor": "rgba(242, 242, 242, 0.06)",
            "watchlist": [],
            "withdateranges": false,
            "compareSymbols": [
                {
                    "symbol": "CAPITALCOM:NICKEL",
                    "position": "NewPriceScale",
                    "color": "#FF9800",
                    "lineWidth": 2
                }
            ],
            "studies": [],
            "autosize": true
        }

        script.textContent = JSON.stringify(config)

        if (containerRef.current) {
            const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget')
            if (widgetContainer) {
                widgetContainer.appendChild(script)
            }
        }

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script)
            }
        }
    }, [])

    return (
        <div className="w-full h-60 bg-black">
            <div className="w-full h-60" ref={containerRef}>
                <div className="tradingview-widget-container w-full h-60">
                    <div className="tradingview-widget-container__widget w-full h-60"></div>
                </div>
            </div>
        </div>
    )
}

export default TradingViewChart
