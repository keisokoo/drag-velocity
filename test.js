const path = require("path")
const glob = require("glob")
const files = glob.sync(path.join("src/views/", "**/*.pug"))
const entryObject = files.reduce((obj, file) => {
  let version = file.split("src/views/").pop().slice(0, -4)
  obj[version] = file
  return obj
}, {})
console.log(entryObject)
