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
  if (side == 'left') {
    nums.reverse()
    el.classList.add('left')
  } else el.classList.add('right')
  el.innerHTML = nums.map(num => `<span>${num+1}</span>`).join('')

  const cells = [...el.children]
  el.classList.add('num-scale')
  el.contentEditable = 'false'

  el.onmousemove =({target})=> {
    if (el == target) return
    cells.forEach(cell => {
      if (+cell.innerText > +target.innerText)
        cell.classList.remove('colored')
      else cell.classList.add('colored')
      cell.classList.remove('with-num')
    })
    target.classList.add('with-num')
  }

  el.onmouseleave =()=> el.onmousemove({target: [...el.children]
    .find(cell => cell.innerText == el.value)})

  el.onclick =({target})=> el.value = target.innerText
}