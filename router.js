const subPages = {
  home: {
    title: "Lizard Attention Tracker",
    htmlFile: 'home.html',
    cssFile: 'home.css',
  },
  table: {
    title: "LAT Attention Table",
    htmlFile: 'table.html',
    cssFiles: ['numscale.css', 'table.css'],
    jsFile: 'table.js',
  },
}

// a fix for the cases where site is hosted deeper than the root level
// you can simply assign a number that tells how deeply is your site hosted
const rootDepth = location.host.endsWith('.github.io')? 1 : 0,
    rootPath = location.pathname.match(/\/[^/]*/g).slice(0, rootDepth).join('')

let path = getPath()
if (path) goto(path)
else onload =()=> goto(getPath() || ls.page)

onpopstate = e => goto((e.state || {path}).path, false)


async function goto(path, saveHistory=true) {
  path = path || 'home'

  if (saveHistory) history.pushState({path}, path, rootPath+'/'+path)

  const page = subPages[path]
  document.title = page.title

  if (!page.html && page.htmlFile)
    page.html = await getTxt(`${rootPath}/${path}/${page.htmlFile}`)

  if (page.html) mainWrapper.htm(page.html)

  try { subPageStyling.remove() } catch {}

  if (!page.css && page.cssFile)
    page.css = await getTxt(`${rootPath}/${path}/${page.cssFile}`)

  if (!page.css && page.cssFiles)
    page.css = (await Promise.all(page.cssFiles
      .map(file => getTxt(`${rootPath}/${path}/${file}`)))).join('\n')

  if (page.css)
    head.append(crEl('style', {innerHTML: page.css, id: 'subPageStyling'}))

  if (page.jsFile &&
      !doc.querySelector(`[src="${rootPath}/${path}/${page.jsFile}"]`))
        head.append(crEl('script', {src: `${rootPath}/${path}/${page.jsFile}`}))

  try { if (page.js) eval(page.js) } catch {}

  ls.page = path
}

function getPath() {
  return /([^/]*)\/?$/
    .exec(location.pathname.replace('/index.html','').slice(rootPath.length))[1]
}