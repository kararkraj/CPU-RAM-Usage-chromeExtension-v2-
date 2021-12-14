let preCpuInfo, interval, tabId;

chrome.runtime.onInstalled.addListener(function () {

});
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'localhost' },
        })],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
});

chrome.webNavigation.onCompleted.addListener(() => {
    console.log("webNavigation.onCompleted");
    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
        if (!interval) {
            tabId = tab[0].id;
            interval = setInterval(() => {
                chrome.system.cpu.getInfo((cpuInfo) => {
                    chrome.system.memory.getInfo((memoryInfo) => {
                        let ramUsagePercent = Math.round(100 * (memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity);
                        let cpuUsagePercent = 0;
                        for (let i = 0; i < cpuInfo.numOfProcessors; i++) {
                            let usage = cpuInfo.processors[i].usage;
                            if (preCpuInfo) {
                                let oldUsage = preCpuInfo.processors[i].usage;
                                cpuUsagePercent += Math.floor((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) / (usage.total - oldUsage.total) * 100);
                            } else {
                                cpuUsagePercent += Math.floor((usage.kernel + usage.user) / usage.total * 100);
                            }
                        }
                        preCpuInfo = cpuInfo;

                        let data = {
                            cpu: Math.round(cpuUsagePercent / cpuInfo.numOfProcessors),
                            ram: ramUsagePercent
                        };
                        chrome.tabs.executeScript(
                            tabId,
                            { code: `window.postMessage(${JSON.stringify(data)})` }
                        );
                    });
                });
            }, 2000);
        }
    });
}, { url: [{ urlMatches: 'localhost' }] });

chrome.tabs.onRemoved.addListener((id) => {
    if (id === tabId) {
        clearInterval(interval);
        interval = undefined;
    }
});

function sendCPUAndRAMDetails(data) {
    window.postMessage(data);
}