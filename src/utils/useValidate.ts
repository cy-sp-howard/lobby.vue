import _ from 'lodash'
import {
  type AnyObjectSchema,
  type Message,
  addMethod,
  setLocale,
  string,
  ref,
  ValidationError,
} from 'yup'
import { computed, isReactive, reactive, watch } from 'vue'
import useLang from './useLang'

setLocale({
  mixed: {
    required: 'required',
    notType: 'vaildateErr',
  },
})
addMethod(
  string,
  'equal',
  function (targetRef: ReturnType<typeof ref>, message: Message = 'equal') {
    return this.test('equal', message, function (val) {
      return this.resolve(targetRef) === val
    })
  },
)
addMethod(
  string,
  'notEqual',
  function (targetRef: ReturnType<typeof ref>, message: Message = 'notEqual') {
    return this.test('notEqual', message, function (val) {
      return String(this.resolve(targetRef)).toLowerCase() !== String(val).toLowerCase()
    })
  },
)
addMethod(string, 'upperInside', function () {
  return this.matches(/[A-Z]/, {
    message: 'upperInside',
  })
})
addMethod(string, 'azDig6to12', function () {
  return this.matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/, { message: 'azDig6to12' })
})
addMethod(string, 'phone', function () {
  return this.matches(/^\+?[\d]*$/, { message: 'phoneErr' })
})
addMethod(string, 'mail', function () {
  return this.matches(/.*@.*\..*/, { message: 'mailErr' })
})
addMethod(string, 'line', function () {
  return this.matches(/^[.|\-|_|\d|A-z]*$/, { message: 'lineErr' })
})

export default function <Schema extends AnyObjectSchema, T extends Record<string, unknown>>(
  s: Schema,
  data: T,
) {
  const { texts } = useLang()
  const errors = reactive<Record<string, string[]>>({})
  const disabledValidate = {} as Record<keyof T, boolean>

  if (!isReactive(data)) throw new Error('data not reactive')
  _.each(data, (i, key) => {
    watch(
      () => data[key],
      () => {
        const pickKeys = _.chain(errors).keys().concat(key).value()
        if (disabledValidate[key]) {
          disabledValidate[key as keyof T] = false
          return
        }
        validate(s.pick(pickKeys)).catch(() => {})
      },
    )
  })

  function validate(schema: AnyObjectSchema = s) {
    _.each(errors, (i, k) => {
      errors[k] = []
    })
    return (schema as Schema).validate(data, { abortEarly: false }).catch(e => {
      if (e instanceof ValidationError) {
        _.each(e.inner, i => {
          if (i.path) {
            const directChildKey = i.path.split(/\[|\./)[0]
            errors[directChildKey] = errors[directChildKey] || []
            errors[directChildKey].push(i.message)
          }
        })
      }
      return Promise.reject(e)
    })
  }

  function resetValues(keys?: (keyof T)[]) {
    const _data = s.getDefault()
    _.each(keys || _.keys(data), i => {
      data[i] = _data[i]
      disabledValidate[i] = true
      delete errors[i as string]
    })
  }

  return {
    errorsOrigin: computed(() => _.mapValues(data, (i, k) => errors[k] || [])),
    errors: computed(() => {
      return _.mapValues(data, (i, k) => {
        const msgs = errors[k] || []
        return texts.value[msgs[0] || '']
      })
    }),
    validate,
    resetValues,
  }
}
