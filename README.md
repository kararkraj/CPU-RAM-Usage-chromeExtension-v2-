# Chrome extension for getting CPU and RAM usage details

# Steps to install and run:

1) Open `edge://extensions/` or `chrome://extensions/`
2) Enable `Developer mode`
3) Click on `Load unpacked` and select this directory (which contains manifest.json)
4) Refresh the Angular web application and observe that the gauge meter updates itself dynamically.

# Bug fixes

1) setInterval stopped when the service worker became inactive after around 30 seconds
	- Ths is an open issue with manifest v3 and it is fixed by downgrading to manifest v2
2) Extension stops working on browser restart or tab reopen
	- All event listeners were wrapped by a parent event listener chrome.runtime.onInstalled
    - Resolved this by moving all the event listeners outside of chrome.runtime.onInstalled