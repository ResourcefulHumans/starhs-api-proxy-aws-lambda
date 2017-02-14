import {expect} from 'chai'

export const itShouldHaveLinkTo = (response, model, list = false, rel) => {
  const link = response.$links.filter(l => {
    if (!l.subject.equals(model.$context)) return false
    if (list && !l.list) return false
    return l.rel === rel
  })[0]
  expect(link.subject.equals(model.$context)).to.equal(true)
  expect(link.list).to.equal(list)
  expect(link.rel).to.equal(rel)
}
