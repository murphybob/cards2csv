// If someone asks for a CSV of all the card data from the live ES this can do that:
const fetch = require("node-fetch")
const json2csv = require("json2csv").parse
const fs = require("fs")

const outfile = "output.csv"

function flatten (source, result = {}, base = "") {
  const keys = Object.keys(source)
  keys.forEach(k => {
    if (typeof source[k] === "object") {
      result = flatten(source[k], result, `${base}${k}_`)
    } else {
      result[base + k] = source[k]
    }
  })
  return result
}

fetch("https://carddatabase.warhammerchampions.com/warhammer-cards/_search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    size: 1000,
    sort: ["collectorNumber"]
  })
}).then(resp => resp.json()).then(data => {
  const flattened = data.hits.hits.map(h => flatten(h._source))
  try {
    console.log("Found", flattened.length, "cards")
    const csv = json2csv(flattened)
    fs.writeFileSync(outfile, csv)
    console.log("Wrote to", outfile)
  } catch (err) {
    console.error(err)
  }
})
