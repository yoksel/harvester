# Harvester

[Puppeteer](https://github.com/GoogleChrome/puppeteer)-based tool for collecting different types of data:

* links
* screenshots
* code snippets

## Tasks

### Links

Can be useful for old large sites with vague structure. You can found something unexpected.

### Screenshots

Tool can make screenshots of given pages with given dimensions and device emulation. You can run task twice to compare result with previous.

### Snippets

Useful if you need download all your demos from external service.

## Usage

1. Clone:

`git clone git@github.com:yoksel/harvester.git --depth 1 && cd harvester`

2. Run `npm i`

3. Rename `credits-example.js` to `credits.js` and fill it with real logins and passwords. `credits.js` is in `gitignore` and will not be commited

4. Take needed example file in tasks, rename it without `example` (`screens.example.js` -> `screens.js`) and fill it with real data. Task files are in `gitignore` and will not be commited

5. Run `npm start` and open [localhost:3007](http://localhost:3007/)

You'll see page wich allows you to start ans stop tasks, see collected data and to download it in archive.

---

Tool is in development. If you find a bug, [fill an issue](https://github.com/yoksel/harvester/issues/new)
