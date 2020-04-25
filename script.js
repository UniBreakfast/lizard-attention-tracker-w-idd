table.innerHTML = poaListToTableHtml(poaList)

function poaListToTableHtml(list) {
  return `<thead>
    <tr>
      <th>preferred attention</th>
      <th>point of attention</th>
      <th>actual attention</th>
    </tr>
  </thead>
  <tbody>
    ${ list.map(({name, aPrefer, aActual}) => `<tr>
      <td contenteditable>${aPrefer}</td>
      <td contenteditable>${name}</td>
      <td contenteditable>${aActual}</td>
    </tr>`).join('') }
  </tbody>`
}

table.querySelectorAll('td:last-child').forEach(replaceWithNumScale)
table.querySelectorAll('td:first-child').forEach(td =>
  replaceWithNumScale(td, 'left'))

function replaceWithNumScale(el, side='right') {
  el.value = el.innerText
  const nums = [...Array(10).keys()]
  if (side == 'left') nums.reverse()
  el.innerHTML = nums.map(num => `<span>${num+1}</span>`).join('')
  el.classList.add('num-scale')
}