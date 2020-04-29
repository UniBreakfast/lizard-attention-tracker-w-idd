
fetch(loader.dataset.src).then(r=>r.text()).then(scripts => {
  scripts.match(/(?<=src=")[^"]*(?=")/g).forEach(src => document.head
    .append(Object.assign(document.createElement('script'), {src})))
  loader.remove()
})
