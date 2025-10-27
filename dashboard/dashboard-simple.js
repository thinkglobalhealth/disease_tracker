const manifest = require('../projects')

let projects = []
for (let p in manifest){
  let project = {}
  project["name"] = manifest[p]['name']
  project["headline"] = manifest[p]['headline']
  project["url"] = `https://${manifest[p]['s3UrlRoot']}/${project["name"]}/index.html`
  projects.push(project)
}
// projects.sort((a, b) => (a.dir > b.dir) ? 1 : -1)

let information = ''
let tally = 0;
let blockList = ['cs-slide1', 'cs-slide2', 'cs-slide3', 'cs-slide4', 'cs-slide5', 'makeamap', 'emails']
for (let p in projects){
  console.log(projects[p])
  if (blockList.includes(projects[p]['name'])) {
    continue;
  }
  let view = `<a href='${projects[p]["url"]}'>View</a>`

  tally++ 

  information += `${view}<p class="dir">${projects[p]["name"]}</p><p class="hed">“${projects[p]["headline"]}”</p>`
}

let total = Object.keys(projects).length - blockList.length
let projectCount = `<p class='count'>There are <span class="highlighted">${tally} out of ${total} graphics</span> currently online.</p>`
document.getElementById("hero").insertAdjacentHTML('beforeend', projectCount);

document.getElementById("projects").innerHTML = information;