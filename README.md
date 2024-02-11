This is a simple extension that displays a meter that shows how popular a page is on Wikipedia. 

You can install it from the Chrome Web Store here:
https://chromewebstore.google.com/detail/wikipedia-page-popularity/ffepfdinnkohlngbkfnnjaocnffnaldj

Or, if you want to build the extension from source, run ```npm install```, then ```npm run build```.

I made this extension because knowing how popular a page is is something that I personally find useful. On Wikipedia it's quite easy to suddenly realize you're studying some esoteric subfield that you shouldn't even know about, when you don't even understand the basics. This extension is like a barometer that tells you how far down the rabbit hole you've gone, and at what point you should probably resurface. Plus, it's just kind of fun to see how popular a page is compared to others.

The popularity is measured by comparing the approximate number of page views for an article over the past 30 days to that of the 10th most popular article. The meter also has mouseover text which tells you additional information about the article's view statistics.

It supports all languages. 

The storage permission is used so that the extension doesn't have to fetch page statistics as frequently, but can instead cache them for a while.

I used a square root scale to represent the great variation in page views between pages in a way that feels natural.

