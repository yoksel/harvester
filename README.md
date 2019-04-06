# Harvester

[Puppeteer](https://github.com/GoogleChrome/puppeteer)-based tool for collecting different types of data:

* links
* screenshots
* code snippets

Describe tasks in configs and tool will allow you to run it from web interface:

<img src="https://github.com/yoksel/harvester/blob/master/public/assets/previews/web-interface.png"
alt="Harvester web interface"/>

The result will be printed to page:

<img src="https://github.com/yoksel/harvester/blob/master/public/assets/previews/screens.png"
alt="Harvester web interface"/>

## Available tasks

### Links

Can be useful for old large sites with vague structure. You can found something unexpected.

Config example: <a href="https://github.com/yoksel/harvester/blob/master/tasks/urls.example.js">tasks/urls.example.js</a>

### Screenshots

Tool can make screenshots of given pages with given dimensions and device emulation. You can run task twice to compare result with previous.

Config example: <a href="https://github.com/yoksel/harvester/blob/master/tasks/screens.example.js">tasks/screens.example.js</a>

### Snippets

Useful if you need download all your demos from external service.

Config example: <a href="https://github.com/yoksel/harvester/blob/master/tasks/snippets.example.js">tasks/snippets.example.js</a>

## Usage

1. Clone:

`git clone git@github.com:yoksel/harvester.git --depth 1 && cd harvester`

2. Run `npm i`

3. Rename `credits-example.js` to `credits.js` and fill it with real logins and passwords. It'll allow you to log in and visit a site as a logged in user.

4. Take needed example file in tasks, rename it without `example` (`screens.example.js` -> `screens.js`) and fill it with real data.

5. Run `npm start` and open [localhost:3007](http://localhost:3007/)

You'll see page wich allows you to start and stop tasks, see collected data and to download it in archive.

`credits.js` and task files are in `gitignore` and will not be commited. Don't push your passwords to the public repository.

## Previews

**Collected links**

<img src="https://github.com/yoksel/harvester/blob/master/public/assets/previews/links.png"
alt="Links task result"/>

**Collected links with screenshots**

<img src="https://github.com/yoksel/harvester/blob/master/public/assets/previews/links__screens.png"
alt="Links task result with screens"/>

**Full view of the screenshot**

<img src="https://github.com/yoksel/harvester/blob/master/public/assets/previews/fullview.png"
alt="Full view"/>

**Full view of the screenshot with diff**

<img src="https://github.com/yoksel/harvester/blob/master/public/assets/previews/fullview--diff.png"
alt="Full view with diff"/>

---

Tool is in development. If you find a bug, [fill an issue](https://github.com/yoksel/harvester/issues/new)
