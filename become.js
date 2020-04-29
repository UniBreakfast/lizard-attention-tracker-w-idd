fetch(loader.dataset.src).then(r=>r.text()).then(html => {
  ({head, body} = doc = document)

  body.innerHTML = /<body>([\s\S]*)<\/body>/.exec(html)[0]

  const headHtml = /<head>([\s\S]*)<\/head>/.exec(html)[0]

  headHtml.match(/(?<=<link )[^>]*(?=>)/g).forEach(attrs => {
    const link = doc.createElement('link')
    attrs.split(/(?<=") /).forEach(attr => {
      const [key, value] = attr.split('="')
      link[key] = value.slice(0, -1)
    })
    head.append(link)
  })

  headHtml.match(/(?<=<script )[^>]*(?=>)/g).forEach(attrs => {
    const script = doc.createElement('script')
    attrs.split(/(?<=") /).forEach(attr => {
      const [key, value] = attr.split('="')
      if (value) script[key] = value.slice(0, -1)
    })
    head.append(script)
  })

  loader.remove()
})
