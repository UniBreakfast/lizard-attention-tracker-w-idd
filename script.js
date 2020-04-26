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

  el.classList.add('num-scale')
  el.contentEditable = 'false'
  const cells = [...el.children]

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

  el.onclick =({target})=> target != el && (el.value = target.innerText)

  el.onmouseleave()
}

function tableToPoaList(table) {
  return [...table.rows].slice(1)
    .map(({cells: [{value: aPrefer}, {innerText: name}, {value: aActual}]})=>
      ({name, aPrefer, aActual})).filter(({name})=> name)
}
