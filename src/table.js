// @flow

import S from 'sanctuary';

const blank = () => Object.create(null);

const descriptorEntry = value => ({ value, enumerable: true });

const makeDescriptor = ps => ps
      .reduce((acc, [k,v]) => (acc[k] = descriptorEntry(v), acc), blank());

const tableEntry = o => {
  const entries = Object.entries(o);
  const descriptor = (typeof o !== 'object') ?
        { [S.toString(o)]: descriptorEntry(o) } :
        makeDescriptor(entries);
  return Object.create(null, descriptor);
};

const fl = 'fantasy-land';

const isDefault = o => S.equals(S.toString(o[1]), o[0]);

const Table (t, d) => ({
  t,
  get: k => k in t ? t[k] : d,
  `${fl}/equals`: S.equals(t),
  `${fl}/concat`: S.compose(Table, S.concat(t), S.prop('t')),
  `${fl}/map`: S.flip(S.map)(t),
  `${fl}/reduce`: (f, init) => S.reduce_(f, init, t),
  `${fl}/ap`: S.compose(
    S.reduce_((acc, [k,f]) => k in t ? (acc[k] = f(t[k]), acc) : acc, blank()),
    S.pairs),
  `${fl}/alt`: S.alt(t),

});

Table.from = S.compose(Table, S.curry(Object.create)(null), makeDescriptor);
Table[`${fl}/of`] = a => S.compose(Table, tableEntry);
Table[`${fl}/empty`] = () => S.compose(Table, blank);

const f = t.get();
if (!S.is(Function, f)) throw Error('The argument must have a value of a function.');
return S.map(f, this);

export default class Table {
  _table: Object;
  constructor(a: any) {
    this._table = a ? tableEntry(a) : blank();
  }

  static from(ps) {
    const t = S.empty(Table);
    t._table = Object.create(null, makeDescriptor(ps));
    return t;
  }

  // $FlowFixMe: computed property keys not supported
  static [`${flPrefix}/of`](a: any) { return new Table(a); }

  // $FlowFixMe: computed property keys not supported
  static [`${flPrefix}/empty`]() { return new Table(); }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/concat`](t: Table) {
    const newT = S.empty(Table);
    newT._table = S.concat(this._table, t._table);
    return newT;
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/map`](f: (a: any) => any): Table {
    const t = S.empty(Table);
    t._table = S.reduce_((t, [k, v]) => {
      const result = f(v);
      if (isDefault([k,v])) {
        k = S.toString(result);
      }
      t[k] = result;
      return t;
    }, blank(), S.pairs(this._table));
    return t;
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/reduce`](f, acc) {
    return S.reduce_((a, e) => f(a, e), acc, S.pairs(this._table));
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/ap`](t: Table) {
    const f = t.get();
    if (!S.is(Function, f)) throw Error('The argument must have a value of a function.');
    return S.map(f, this);
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/alt`](t: Table) {
    return this._table.length > 0 ? this : t;
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/extend`](f: Function) {
    return new Table(f(this));
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/extract`]() {
    const pairs = S.pairs(this._table);
    if (pairs.length === 0) return blank();
    if (pairs.length == 1) {
      const [[k,v]] = pairs;
      if (isDefault(pairs[0])) return v;
      const result = blank();
      result[k] = v;
      return result;
    }
    return Object.assign(blank(), this._table);
  }

  // $FlowFixMe: computed property keys not supported
  [`${flPrefix}/equals`](t: Table) {
    return S.equals(this._table, t._table);
  }

  append(a: any) {
    return S.concat(this, S.of(Table, a));
  }

  get(k: string | Symbol) {
    const key = typeof k === 'string' ? k : S.toString(k);
    let result = S.get(S.K(true), key, this._table);
    let defaultFlag = false;
    if (S.isNothing(result)) {
      defaultFlag = true;
      result = S.find(isDefault, S.pairs(this._table));
    }
    result = S.maybeToNullable(result);
    return !defaultFlag ? result : (result != null ? result[1] : void 0);
  }
}
