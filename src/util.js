const header = (headers, header) => {
  return headers.map(header => header.toLower())[header]
}

module.exports = {
  header
}
