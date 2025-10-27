import {DataTable} from 'simple-datatables'

const manifest = require('../projects')
//Eddie Liu scrapper data here
const data = require('../dashboard/data/2022-03-21-datawrapper-vallenato.csv')
//Python script to get titles goes here
//const data2 = require('../dashboard/data/datawrapper.csv')
const myTable = document.querySelector("#myTable");

/*
TO run 
replace csv with new files and rerun

npm run build-dashboard

IF ERRORS IN NODE
Unhandled rejection (<{"message":"\u001b[31m[WEBPACK]\u001b[...>, no stack trace)
  - add line to start of csv   param,info,url
  - npm install or make sure correct file is located in dashboard/data
*/

let compiledProjects = (process.env.PROJECTS)
let statusProjects = data
// console.log(statusProjects)
// let status = []
let names = []
let graphics = {}
let lookup = {}
let x
let files = []
let status = []
let dw = []
let article = ''
let active = new Set()

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function getStage(project) {
  return (project ? 'Yes' : 'No');
}

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) !== -1){
        indexes.push(i);
    }
    return indexes;
}

for (x in statusProjects) {
if (statusProjects[x]['url']){
  // different index value per domain

    if (statusProjects[x]['url'].split('/')[2] === 'www.cfr.org') {
      files = []
      status = []
      names = []
      // graphics[statusProjects[x]['url'].split('/')[4]] = {}
      article = statusProjects[x]['url']
      // article_name
      // console.log(statusProjects[x]['url'].split('/')[4])
    } else if (statusProjects[x]['url'].split('/')[2] === 'vallenato-media.cfr.org') {
      // skip image width and NO DATA
      if (statusProjects[x]['param'] !== 'width' && statusProjects[x]['info'] !== '') {
          files.push(statusProjects[x]['url'].split('/')[4])
          status.push(statusProjects[x]['info'])

            // file_name
          names.push(statusProjects[x]['url'].split('/')[3])
          active.add(statusProjects[x]['url'].split('/')[3])
            // console.log('     ' + statusProjects[x]['url'].split('/')[3] + '/' + statusProjects[x]['url'].split('/')[4])
            // status_code
            // console.log('     ' + 'status_code : ' + statusProjects[x]['info'])
      }
      // page title : page info
      // pages[statusProjects[x]['url'].split('/')[3]].graphics = names
      graphics[article.split('/')[4]] = {
        'url': article,
        'names': names.filter(onlyUnique),
        'projects': names,
        'files' : files,
        'status' : status,
        'type' : 'vallenato'
      }

    } else {
      //console.log(statusProjects[x])
        if (statusProjects[x]['param'] !== 'width' ) {
          // console.log(article.split('/')[4])
          // console.log(statusProjects[x]['url'].split('/')[2], statusProjects[x]['url'].split('/')[3], 'datawrapper')

          files.push(statusProjects[x]['url'].split('/')[3])
          status.push(statusProjects[x]['info'])

            // file_name
          names.push(statusProjects[x]['url'].split('/')[3])
          active.add(statusProjects[x]['url'].split('/')[3])
          dw.push(statusProjects[x]['url'])
        // datawrapper
          graphics[article.split('/')[4]] = {
          'url': article,
          'names': names.filter(onlyUnique),
          'projects': names,
          'files' : files,
          'status' : status,
          'type' : 'datawrapper'
        }
      }

    }
    lookup['graphics'] = active
  }
}
// console.log(graphics, lookup, dw)
let projects = []
let info = []

let dwProjects = {}
//console.log(data2)
/*
for (let d of data2){
  let project = {}
  dwProjects[d.code] = d.title
  project["dir"] = d.code
  project["hed"] = d.title
  project["url"] = d.url
  project["type"] = 'datawrapper'
  projects.push(project)
}*/

for (let p in manifest){
  let project = {}
  project["dir"] = String(Object.keys(manifest[p]))
  project["hed"] = manifest[p][project.dir]
  project["type"] = 'vallenato'
  project["url"] = `${window.location.origin}/${Object.keys(manifest[p])}`
  projects.push(project)
}

// console.log(dwProjects)

projects.sort((a, b) => (a.dir > b.dir) ? 1 : -1)

let information = []
let tally = 0;
let blockList = ['cs-slide1', 'cs-slide2', 'cs-slide3', 'cs-slide4', 'cs-slide5', 'makeamap', 'emails']
// lookup.graphics.values()
// console.log(projects)
for (let p in projects){
  if (blockList.includes(projects[p]['dir'])) {
    continue;
  }

  let isViewable = compiledProjects.includes(projects[p]['dir'])
  // let view = `<a href='${window.location.origin}/${projects[p]["dir"]}'>View</a>`
  // let error = `<p><span class='highlighted'>N/A</span></p>`

  let found = getStage(lookup['graphics'].has(projects[p]['dir']))

  isViewable? tally++ : null

  // information += `${isViewable? view : error}<p class="dir">${projects[p]["dir"]}</p><p class="hed">“${projects[p]["hed"]}”</p><p>${found}</p>`
  info = [`${projects[p]["url"]}`, `${projects[p]["dir"]}`, `“${projects[p]["hed"]}”`, `${found}`, `${projects[p]["dir"]}`, `${projects[p]["dir"]}`, `${projects[p]["type"]}`]
  information.push(info)
}

// directories minus datawrapper minus blocked, 
let total = Object.keys(projects).length - Object.keys(dwProjects).length - blockList.length
let projectCount = `<p class='count'>There are <span>${tally} found out of ${total} staged Vallenato and ${Object.keys(dwProjects).length} Datawrapper</span> graphics.</p>`

document.getElementById("hero").insertAdjacentHTML('beforeend', projectCount);

/*
document.getElementById("projects").innerHTML = information;
*/

const myData = {
  'headings': ['link', 'name', 'title', 'match', 'status', 'article', 'type'],
  data: information
}

function renderLink(data, cell, row) {
  if (data){
    // console.log(data)
    return `<a href='${data}' target='_blank'>View</a>`
  }
}

function renderType(data, cell, row) {
  if (data){
    return data
  } else {
    return '-'
  }
}

function renderLinkArticle(data, cell, row) {
  if (data && Object.values(graphics).filter(item=>item.names.includes(data)).length > 0 ){

    let links = Object.values(graphics).filter(item=>item.names.includes(data))
    let urls = []
    for (let x in links){
      urls.push(`  <a href='${Object.values(graphics).filter(item=>item.names.includes(data))[x].url}' target='_blank'>${+x + 1}</a>  `)
    }
    if (Object.values(graphics).filter(item=>item.names.includes(data)).length > 1){
      urls.join('  ,  ')
    }

    return urls
  } else {
    return '-'
  }
}

function renderStatus(data, cell, row) {
  // console.log(data)
  if (data && Object.values(graphics).filter(item=>item.names.includes(data)).length > 0 ){
    let z = Object.values(graphics).filter(item=>item.names.includes(data))
    // console.log(z)
    let s = ''
    for (let zz in z){
      let idx = getAllIndexes(z[zz].projects, data)
      // console.log(idx)
      for (let i in idx) {
        // console.log(z[zz].files[idx[i]])
        // console.log(z[zz].status[idx[i]])
        let c = (z[zz].status[idx[i]] === '200') ? '#799f56' : '#b73521'

        s += `<div style="color:white;font-size:13px;background-color:${c};margin:3px;padding:3px"><div>${z[zz].files[idx[i]]}</div></div>`
      }


    }

    return s
    /*.reduce(function(a, e, i) {
      if (e === data)
        a.push(i);
      }, [])*/

  } else {
    return '-'
  }
}

const dataTable = new DataTable(myTable,{
    data: myData,
    perPageSelect: [10, 50, 100, 200],
    perPage: 10,
    columns: [
      { select: 0, render: renderLink , width: '10%' },
      { select: 3, hidden: true },
      { select: 4, render: renderStatus, width: '10%'},
      { select: 5, render: renderLinkArticle, width: '10%'},
      { select: 6, render: renderType, width: '10%'}
    ]
  });