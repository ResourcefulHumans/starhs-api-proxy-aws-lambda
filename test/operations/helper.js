import {filter, head} from 'lodash/fp'
import {expect} from 'chai'

export const itShouldHaveLinkTo = (response, model, list = false, rel) => {
  const query = {$context: model.$context.toString()}
  if (list) query.list = true
  if (rel) query.rel = rel
  const link = head(filter(query)(response.$links))
  expect(link.$context).to.equal(model.$context.toString())
  expect(link.list).to.equal(list ? true : undefined)
  expect(link.rel).to.equal(rel)
}
