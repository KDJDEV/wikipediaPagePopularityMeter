function waitForElm(selector, parent) {
    return new Promise(resolve => {
        let observeParentElement = document; //if a parent is not specified, then we will default to the document root
        if (parent !== undefined) {
            observeParentElement = parent;
        }
        function tryGetElem() {
            let elem = observeParentElement.querySelector(selector);
            if (elem) {
                resolve(elem);
                observer.disconnect();
            }
        }

        const observer = new MutationObserver(tryGetElem);

        observer.observe(parent === undefined ? document.body : observeParentElement, {
            childList: true,
            subtree: true
        });

        tryGetElem();
    });
}
function getNationPrefix() {
    const href = window.location.href;
    const nationPrefix = href.substring(
        href.indexOf("/") + 2,
        href.indexOf(".")
    );

    return nationPrefix;
}
async function getPageviews(pageTitle) {
    const endpoint = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${getNationPrefix()}.wikipedia/all-access/all-agents/${encodeURIComponent(pageTitle)}/daily`;
    const endDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Current date in YYYYMMDD format
    const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10).replace(/-/g, ''); // 30 days ago in YYYYMMDD format

    const url = `${endpoint}/${startDate}/${endDate}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        let totalViews = 0;
        data.items.forEach(item => {
            totalViews += item.views;
        });
        return totalViews;
    } catch (error) {
        console.error('Error fetching pageviews:', error);
        return null;
    }
}

function getTopBound() {
    return new Promise(async (resolve) => {
        const date = new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().slice(0, 10).replace(/-/g, '/');
        const nationPrefix = getNationPrefix();
        chrome.storage.local.get([`lastFetchedTopBound${nationPrefix}`], async function (result) {
            const lastFetchedTopBound = result.lastFetchedTopBound;
            if (!lastFetchedTopBound || Date.now() - lastFetchedTopBound > 24 * 60 * 60 * 1000) {
                const response = await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${nationPrefix}.wikipedia/all-access/${date}`);
                const article = (await response.json())["items"][0]["articles"].find(page => page.rank === 10).article;
                topBound = (await getPageviews(article));
                chrome.storage.local.set({ [`topBound${nationPrefix}`]: topBound });
                chrome.storage.local.set({ [`lastFetchedTopBound${nationPrefix}`]: Date.now() });
                resolve(topBound);
            } else {
                chrome.storage.local.get([`topBound${nationPrefix}`], async function (result) {
                    topBound = result.topBound;
                    resolve(topBound);
                });
            }
        });
    });
}
(async () => {
    const firstHeading = await waitForElm("#firstHeading");

    var newElement = document.createElement('div');
    newElement.style.display = "inline-block";
    newElement.innerHTML = `<div class="rating">
    <input type="radio" name="rating" id="rata10"><label for="rata10">10</label>
    <input type="radio" name="rating" id="rata9"><label for="rata9">9</label>
    <input type="radio" name="rating" id="rata8"><label for="rata8">8</label>
    <input type="radio" name="rating" id="rata7"><label for="rata7">7</label>
    <input type="radio" name="rating" id="rata6"><label for="rata6">6</label>
    <input type="radio" name="rating" id="rata5"><label for="rata5">5</label>
    <input type="radio" name="rating" id="rata4"><label for="rata4">4</label>
    <input type="radio" name="rating" id="rata3"><label for="rata3">3</label>
    <input type="radio" name="rating" id="rata2"><label for="rata2">2</label>
    <input type="radio" name="rating" id="rata1"><label for="rata1">1</label>    
</div>`;
    const pageTitle = decodeURIComponent(window.location.href.split("/").pop());
    const pageViews = await getPageviews(pageTitle);
    if (pageViews !== null) {
        let topBound = await getTopBound();

        const logPageViews = Math.pow(pageViews, 1 / 2);
        const logTopBound = Math.pow(topBound, 1 / 3);
        const percent = Math.min(logPageViews / logTopBound, 1);
        const number = Math.ceil(percent * 10);
        firstHeading.insertAdjacentElement('afterend', newElement);
        document.querySelector(`#rata${number}`).checked = true;
        document.querySelector(".rating").title = `This page received ${pageViews} views over the last 30 days. This is ${Math.round(pageViews / topBound * 1000) / 10}% as many views as the 10th most popular page.`;
    }
})();