import {filter, head} from 'lodash/fp'
import {expect} from 'chai'

export const itShouldHaveLinkTo = (response, model, list = false, rel) => {
  const link = head(filter(l => {
    if (!l.subject.equals(model.$context)) return false
    if (list && !l.list) return false
    if (rel && l.rel !== rel) return false
    return true
  })(response.$links))
  expect(link.subject.equals(model.$context)).to.equal(true)
  expect(link.list).to.equal(list)
  expect(link.rel).to.equal(rel)
}
