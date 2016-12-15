'use strict'

import Promise from 'bluebird'
import {forIn} from 'lodash'
import URIValue from 'rheactor-value-objects/uri'
import {Object as ObjectType} from 'tcomb'
import {addLink} from '../api'

/**
 * @param {URIValue} mountURL
 * @param {object} routes
 */
export default function (mountURL, routes) {
  URIValue.Type(mountURL)
  ObjectType(routes)
  return {
    get: () => Promise.try(() => {
      const index = {
        $links: []
      }
      const u = mountURL.slashless().toString()
      forIn(routes, (v, k) => addLink(index, new URIValue([u, k].join('/')), v))
      return index
    })
  }
}
