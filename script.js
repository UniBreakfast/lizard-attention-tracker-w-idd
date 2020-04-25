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
