var doc = document,  {head, body} = doc,  ls = localStorage,
   {assign, entries, fromEntries} = Object,  c = console.log,
   {stringify, parse} = JSON,  clone = obj => parse(stringify(obj)),
   compare =(a, b)=> stringify(a)==stringify(b),
   {min, max, floor, ceil, round, random, abs} = Math,
   rnd = n => floor(random()*n),

getThe =(type, url, cb=p=>p)=> fetch(url).then(resp => resp[type]()).then(cb),
getTxt =(url, cb)=> getThe('text', url, cb),
getObj =(url, cb)=> getThe('json', url, cb),  getArr = getObj,

range =(from, to)=> [...Array(to).keys()].map(n => n+from),
mapArr =(len, fn, thisArg)=> Array.from(range(0, len), fn, thisArg),

repeatTill =(fn, delay, duration)=> ( fn(),
  setTimeout(clearInterval, duration, setInterval(fn, delay)) ),
repeatTimes =(fn, delay, count=1)=> { fn()
  const inter = setInterval(()=> --count? fn() : clearInterval(inter), delay)
  return inter },

rotate =(vals, subj, key)=> !key? vals[(vals.indexOf(subj)+1) % vals.length] :
  subj[key] = vals[(vals.indexOf(subj[key])+1) % vals.length],

crEl =(tag,...props)=> doc.createElement(tag).change(...props)

assign(Array.prototype, {
  with: function (props) { return assign(this, props) },
  change: function (fn) { return assign(this, Array.from(this).map(fn)) },
})

assign(Element.prototype, {
  class: function (className, n) { const classes = className.split(' ')
    if (n===1) this.change({className})
    else if (n===-1) this.classList.remove(...classes)
    else if (n) this.classList.toggle(className)
    else this.classList.add(...classes)
    return this },
  htm: function (innerHTML='') { return this.change({innerHTML}) },
  txt: function (innerText='') { return this.change({innerText}) },
  val: function (value='') { return this.change({value}) },
  pre: function (el) { el.parent().insertBefore(this, el); return this },
  aft: function (el) { el.next()? this.pre(el.next()) :
         this.into(el.parent()); return this },
  into: function (el) { el.append(this); return el },
  host: function (arr) { return arr? (this.append(...arr), this) :
          el => this.appendChild(el) },
  mult: function (n=1) { return this.copy(n).map(el => el.aft(this)).reverse()},
  copy: function (n) { return this.clone(n) },
  clone: function (n) { return n? mapArr(n, ()=> this.clone()) :
           this.cloneNode(1) },
  change: function (...props) { for (let subj=this, i=0; i<props.length; ++i) {
      if (typeof props[i]=='string')  subj = typeof this[props[i]]=='function'?
        this[props[i]]() : this[props[i]]
      else assign(subj, props[i]) } return this },
  parent: function (sel) { return sel? this.closest(sel) : this.parentNode },
  child: function (sel) { return typeof sel!='number'? this.first(sel) :
           this.children[sel<0? this.all().length+sel : sel] },
  first: function (sel) { return typeof sel=='number'? this.all().slice(sel) :
           sel? this.querySelector(sel) : this.firstElementChild },
  last: function (sel) { return typeof sel=='number'? this.all().slice(-sel) :
          sel? this.all(sel).pop() : this.lastElementChild },
  prev: function (sel) { return sel? this.sibs(sel)[this.i(sel)-1] :
          this.previousElementSibling },
  next: function (sel) { return sel? this.sibs(sel)[this.i(sel)+1] :
          this.nextElementSibling },
  sibs: function (sel) { return typeof sel!='number'? this.parent().all(sel) :
          this.parent().child(i) },
  subs: function (sel) { const subs = this.all(sel).filter(el =>
          el.parent()==this); return subs.length? subs : null },
  all: function (sel) {
         return [...sel? this.querySelectorAll(sel) : this.children] },
  i: function (sel) { return this.sibs(sel).indexOf(this) },
  arr: function (depth=Infinity) { return [this, ...depth? this.all()
         .map(el => el.arr(depth-1)) : []] },
  arrIn: function (depth=Infinity) { return depth && this.subs()? this.all()
           .map(el => el.arrIn(depth-1)).with({in: this}) : this },
})
