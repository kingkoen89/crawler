# Crawler
A basic webcrawler based on Puppeteer that collects data from a normal and mobile environment (currently set to iPhone 6).

## Prerequisites
Latest versions of npm and node.

## Usage
```
git clone https://github.com/kingkoen89/crawler.git
```
```
npm install
```
Provide a list of URLs in the file _urls.txt_ in the following format on separate lines:  
https://www.example.com
```
node crawler.js
```

## Output
Folder _out_ contains a subfolder for each crawled website with the following layout:  
- domain_name
    - mobile
        - consent_dialog.png
        - cookies.json
        - GET_traffic.json
        - POST_traffic.json
    - normal
        - consent_dialog.png
        - cookies.json
        - GET_traffic.json
        - POST_traffic.json

Subsequent runs will overwrite this folder.



