/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-07-25 20:23:10
 * @version 1.0.0
 * @desc utils.ts
 */


import { existsSync, mkdirSync, writeFileSync } from 'fs'

function surrogate(str: string): string {
  let output = ''
  let code   = 0
  for (let i = 0; i < str.length; i++) {
    code = str.charCodeAt(i)
    if (code < 0x80) {
      output += String.fromCharCode(code)
    } else {
      output += '\\u' + ('0000' + code.toString(16)).substr(-4)
    }
  }
  return output
}

function write(dir: string, data: any) {
  const result_inline: any = {}
  const result_loose: any  = {}
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }
  for (const key in data) {
    result_inline[key] = JSON.stringify(data[key])
    result_loose[key]  = JSON.stringify(data[key], void 0, 2)
    if (key.indexOf('_surrogate') > 0) {
      result_inline[key] = surrogate(result_inline[key])
      result_loose[key]  = surrogate(result_loose[key])
    }
    writeFileSync(`${dir}/${key}_inline.json`, result_inline[key])
    writeFileSync(`${dir}/${key}_loose.json`, result_loose[key])
  }
  writeFileSync(`${dir}/all_inline.json`, JSON.stringify(result_inline, void 0, 2))
  writeFileSync(`${dir}/all_loose.json`, JSON.stringify(result_loose, void 0, 2))
}

function initArray(size: number, exec: (index: number) => any): any[] {
  const output = new Array(size)
  for (let i = 0; i < size; i++) {
    output[i] = exec(i)
  }
  return output
}

function initObject(size: number, key: (index: number) => any, exec: (index: number) => any): any {
  const output: any = {}
  for (let i = 0; i < size; i++) {
    output[key(i)] = exec(i)
  }
  return output
}

function initDeepObject(deep: number, value: any): any {
  const root: any = {}
  let output: any = root
  let i           = 0
  for (; i < deep; i++) {
    output[i] = {}
    output    = output[i]
  }
  output[i] = value
  return root
}

function initDeepArray(deep: number, value: any): any {
  const root: any[] = []
  let output: any[] = root
  let i             = 0
  for (; i < deep; i++) {
    output.push([])
    output = output[0]
  }
  output.push(value)
  return root
}

function initNestArray(deep: number, size: number, value: any, curr = 0): any {
  const output = new Array(deep)
  if (curr === deep) {
    for (let i = 0; i < size; i++) {
      output[i] = value
    }
  } else {
    for (let i = 0; i < size; i++) {
      output[i] = initNestArray(deep, size, value, curr + 1)
    }
  }
  return output
}

function initNestObject(deep: number, size: number, value: any, curr = 0): any {
  const output: any = {}
  if (curr === deep) {
    for (let i = 0; i < size; i++) {
      output[i] = value
    }
  } else {
    for (let i = 0; i < size; i++) {
      output[i] = initNestObject(deep, size, value, curr + 1)
    }
  }
  return output
}

const correct = {
  integer_positive_max: Number.MAX_SAFE_INTEGER,
  integer_negative_max: -Number.MAX_SAFE_INTEGER,
  integer_0: 0,
  float_positive_max: Number.MAX_VALUE,
  float_positive_min: Number.MIN_VALUE,
  float_negative_max: -Number.MAX_VALUE,
  float_negative_min: -Number.MIN_VALUE,
  null: null,
  true: true,
  false: false,
  string_0: '',
  string_1_normal: 'A',
  string_1_escape: '\n',
  string_1_unicode_base: '中',
  string_1_unicode_base_surrogate: '中',
  string_1_unicode_high: '😂',
  string_1_unicode_high_surrogate: '😂',
  string_100_normal: 'A'.repeat(100),
  string_100_escape: '\n\t\r\f\b\\/\"'.repeat(15),
  string_100_unicode_base: '中'.repeat(100),
  string_100_unicode_high: '😀'.repeat(100),
  string_100_unicode_high_surrogate: '😀'.repeat(100),
  string_long_mangled: 'A\r\t\n中\b😀/true/false\"...'.repeat(10000),
  string_long_mangled_surrogate: 'A\r\t\n中\b😀/true/false\"...'.repeat(10000),
  array_0: [],
  array_null: [null],
  array_deep_0: [[]],
  array_deep_null: [[null]],
  array_deep100_null: initDeepArray(100, null),
  array_deep100_2: [initDeepArray(100, null), initDeepArray(100, null)],
  array_100_integer: initArray(100, (i) => i),
  array_100_string: initArray(100, (i) => i.toString()),
  array_100_deep_0: initArray(100, () => []),
  array_100_deep_integer: initArray(100, () => initArray(100, (i) => i)),
  array_100_deep_string: initArray(100, () => initArray(100, (i) => i.toString())),
  object_0: {},
  object_null: { null: null },
  object_empty_key: { '': null },
  object_100_null: initObject(100, (i) => i, () => null),
  object_100_integer: initObject(100, (i) => i, (i) => i),
  object_deep_null: initObject(100, (i) => i, () => initObject(100, (i) => i, () => null)),
  object_deep100_null: initDeepObject(100, null),
  big_array_5_5: initNestArray(5, 7, null),
  big_object_5_5: initNestObject(5, 7, null),
  nested: {
    integer: Number.MAX_SAFE_INTEGER,
    float: Number.MAX_VALUE,
    null: null,
    true: true,
    false: false,
    string: 'hello world\r\b\t\r\f\\"',
    array: [1, null, [], [true], false, '≈çœ∑®†¥∂ƒ©˙∆'],
    object: { 1: null, '∑®†¥': false, 'array': [] },
  },
}

write('correct', correct)
