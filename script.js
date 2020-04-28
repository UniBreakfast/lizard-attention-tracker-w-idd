// loadLastSlice()
onload =()=> {
  loadPoaListToTable(poaList, table)

}


newSliceBtn.onclick = startNewSlice
saveSliceBtn.onclick = saveSlice

onkeydown = e => {
  if (e.code == 'KeyS' && e.ctrlKey) saveSlice(), e.preventDefault()
  if (e.code == 'KeyN' && e.altKey) startNewSlice()
}


function poaListToTable(poaList) {
  table.innerHTML = poaListToTableHtml(poaList)

  table.querySelectorAll('td:last-child').forEach(replaceWithNumScale)
  table.querySelectorAll('td:first-child').forEach(td =>
    replaceWithNumScale(td, 'left'))

  table.querySelectorAll('td:nth-child(2)').forEach(td =>
    td.oninput = handlePoaNameInput)
}

function handlePoaNameInput({target}) {
  if ([...table.querySelectorAll('td:nth-child(2)')]
        .every(td => td.innerText))  addEmptyRow(table)
}

function addEmptyRow(table) {
  const tr = document.createElement('tr')
  tr.innerHTML = '<td>1</td><td contenteditable></td><td>1</td>'
  table.lastChild.append(tr)
  const [left, middle, right] = tr.children
  replaceWithNumScale(left, 'left')
  replaceWithNumScale(right)
  middle.oninput = handlePoaNameInput
}

function poaListToTableHtml(poaList) {
  if (!poaList.find(poa => !poa[1]))
    poaList.push([1,'',1])
  return `<thead>
    <tr>
      <th>preferred attention</th>
      <th>point of attention</th>
      <th>actual attention</th>
    </tr>
  </thead>
  <tbody>
    ${ poaList.map(([needs, name, gets]) => `<tr>
      <td contenteditable>${needs}</td>
      <td contenteditable>${name}</td>
      <td contenteditable>${gets}</td>
    </tr>`).join('') }
  </tbody>`
}

const row0 = table.rows[1]
row0.remove()

function buildTableRow([needs, name, gets]) {
  const row = row0.cloneNode(true),
       [left, middle, right] = row.cells
  middle.innerText = name
  left.dataset.value = needs
  right.dataset.value = gets
  row.style.setProperty('--needs-width', needs+'0%')
  row.style.setProperty('--gets-width', gets+'0%')
  return row
}

function loadPoaListToTable(poaList, {tBodies}) {
  tBodies[0].append(...poaList.map(buildTableRow))
}

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

function tableToPoaList() {
  return [...table.rows].slice(1)
    .map(({cells: [{value: needs}, {innerText: name}, {value: gets}]})=>
      [needs, name.trim(), gets]).filter(poa => poa[1])
}

function poaStringify(poaList) {
  return poaList.map(poa => Object.values(poa).join('|')).join('_')
}

function poaParse(str) {
  return str.split('_').map(str => str.split('|'))
}

function generateSliceLabel() {
  const datetime = new Date,
        year = datetime.getFullYear(),
        month = String(datetime.getMonth()+1).padStart(2, 0),
        day = String(datetime.getDate()).padStart(2, 0),
        date = [year, month, day].join('_'),
        slicesToday = Object.keys(localStorage)
          .filter(key => key.startsWith('slice_'+date))
          .sort((a, b)=> a<b? 1 : -1),
        letter = slicesToday[0]
          ? String.fromCharCode(slicesToday[0].slice(-1).charCodeAt() + 1)
          : 'a'
  return ['slice', date, letter].join('_')
}

function loadLastSlice(noValues) {
  const sliceKeys = Object.keys(localStorage)
    .filter(key => key.startsWith('slice_')).sort((a, b)=> a<b? 1 : -1)
  const poaList = sliceKeys[0]? poaParse(localStorage[sliceKeys[0]]) : []
  sliceLabel.innerText = sliceKeys[0] || generateSliceLabel()
  if (noValues) poaList.forEach(poa => poa[0] = poa[2] = 1)
  poaListToTable(poaList)
}

function startNewSlice() {
  loadLastSlice(1)
  sliceLabel.innerText = generateSliceLabel()
}

function saveSlice() {
  localStorage[sliceLabel.innerText] = poaStringify(tableToPoaList())
  loadLastSlice()
}

table.onmousemove = e => {
  if (e.target.className == 'trap') {
    const [trap, scale, row] = e.path
    let part = Math.ceil(e.offsetX/trap.clientWidth*10) || 1
    if (scale.classList.contains('needs'))  part = 11 - part
    scale.dataset.hoverValue = part
    row.style.setProperty('--hover-width', part+'0%')
  }
}

table.onclick = e => {
  if (e.target.className == 'trap') {
    const [trap, scale, row] = e.path
    let part = Math.ceil(e.offsetX/trap.clientWidth*10) || 1
    if (scale.classList.contains('needs')) {
      scale.dataset.value = 11 - part
      row.style.setProperty('--needs-width', 11-part+'0%')
    } else {
      scale.dataset.value = part
      row.style.setProperty('--gets-width', part+'0%')
    }
  }
}