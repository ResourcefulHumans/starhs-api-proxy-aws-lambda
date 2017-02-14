import {struct, list, refinement, Boolean as BooleanType, String as StringType} from 'tcomb'
import {HttpProblem} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'

/**
 * Convert a Joi Error into a HttpProblem
 *
 * @param error
 * @returns {*}
 */
export function joiErrorToHttpProblem (error) {
  JoiErrorType(error)
  return new HttpProblem(
    new URIValue('https://github.com/ResourcefulHumans/starhs-api-proxy-aws-lambda#ValidationFailed'),
    error.toString(),
    400,
    error.details.map(d => d.message).join(', ')
  )
}

const JoiErrorType = struct({
  isJoi: refinement(BooleanType, b => b, 'isJoiContext'),
  details: list(struct({message: StringType}))
}, 'JoiErrorType')
