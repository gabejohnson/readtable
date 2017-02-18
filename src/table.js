const blank = () => Object.create(null);

const valueSym = Symbol('table/value');

const descriptorEntry = value => ({ value, enumerable: true });

const makeDescriptor = ps => ps
      .reduce((acc, [k,v]) => (acc[k] = descriptorEntry(v), acc), blank());

const tableEntry = o => {
  const entries = Object.entries(o);
  const descriptor = entries.length === 0 ? { [valueSym]: descriptorEntry(o) } : makeDescriptor(entries);
  return Object.create(null, descriptor);
};

function privatize() {
  const wm = new WeakMap();
  return (k, v) => v ? wm.set(k, v) : wm.get(k);
}

const tables = privatize();

const typeError = n => Error(`The argument to ${n} must be of type Table.`);

export default class Table {
  constructor(o) {
    tables(this, o ? [tableEntry(o)] : []);
  }

  static from(ps) {
    const t = Table.empty();
    tables(t, [Object.create(null, makeDescriptor(ps))]);
    return t;
  }

  static of(o) { return new Table(o); }

  static empty() { return new Table(); }

  concat(t) {
    if (!(t instanceof Table)) throw typeError('concat');
    const newT = Table.empty();
    tables(newT, tables(this).concat(tables(t)));
    return newT;
  }

  map(f) {
    const t = Table.empty();
    tables(t,
           tables(this)
           .map(e => Object.entries(e)
                .reduce((o, [k,v]) => (o[k] = f(v), o), blank())));
    return t;
  }

  reduce(f, acc) {
    return Object.entries(this.extract())
      .reduce((a, [k,v]) => f(a, {[k]:v}), acc);
    // return tables(this)
    //   .reduce((t, e) => Object.entries(e)
    //           .reduce((a, [k,v]) => f(a, {[k]:v}), t), acc);
  }

  ap(t) {
    if (!(t instanceof Table)) throw typeError('ap');
    const f = t.get(valueSym);
    if (typeof f !== 'function') throw Error('The argument must have a value of a function.');
    return this.map(f);
  }

  alt(t) {
    if (!(t instanceof Table)) throw typeError('alt');
    return tables(this).length > 0 ? this : t;
  }

  extract() {
    // return this.reduce((a, o) => Object.assign(a, o), blank());
    return Object.assign(blank(), ...tables(this));
  }

  // keys() {
  //   const ts = tables(this);
  //   const keys = ts.reduce((ks, o) => ks.add(...Object.keys(o)), new Set());
  //   return [...keys];
  // }

  append(o) {
    return this.concat(Table.of(o));
  }

  inner() { return tables(this)[0]; }

  outer() {
    const t = Table.empty();
    tables(t, tables(this).slice(1));
    return t;
  }

  get(k) {
    if (k == null) return k;
    const vals = tables(this).filter(e => e[k]);
    if (vals.length === 0 && k !== valueSym) return this.get(valueSym);
    return (vals[vals.length-1] || blank())[k];
  }

  // set(k, v) { return this.append({[k]: v}); }
}

Table['fantasy-land/of'] = Table.of;
Table['fantasy-land/empty'] = Table.empty;
Table.prototype['fantasy-land/concat'] = Table.prototype.concat;
Table.prototype['fantasy-land/map'] = Table.prototype.map;
Table.prototype['fantasy-land/reduce'] = Table.prototype.reduce;
Table.prototype['fantasy-land/alt'] = Table.prototype.alt;
Table.prototype['fantasy-land/extract'] = Table.prototype.extract;
Table.prototype['fantasy-land/ap'] = Table.prototype.ap;
