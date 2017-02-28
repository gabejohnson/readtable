import test from 'ava';

import Z, { Extend, Apply, Foldable, Applicative, Functor, Semigroup, Monoid } from 'sanctuary-type-classes';
import { create, env } from 'sanctuary';


import Table from '../src/table';

const S = create({ checkTypes: false, env });
const pure = S.of(Table);

test('Constructor should return an instance derived from the input', t => {
  const o = new Table({a:1});
  t.is(o.get('a'), 1);
});

test('Table.of should return the same thing as the constructor', t => {
  const t1 = pure({a:1});
  t.true(S.equals(t1, new Table({a:1})));

  // identity
  t.true(S.equals(S.ap(pure(S.I), t1), t1));

  const f = S.inc;
  const x = 1;
  // homomorphism
  let lhs = S.ap(pure(f), pure(x));
  let rhs = pure(f(x));
  t.true(S.equals(lhs, rhs));

  // interchange
  let u = pure(f);
  lhs = S.ap(u, pure(x));
  rhs = S.ap(pure(f => f(x)), u);
  t.true(S.equals(lhs, rhs));

  t.true(Applicative.test(t1));
});

test('Table.empty should return an empty table', t => {
  const t1 = S.empty(Table);
  t.true(S.equals(t1, pure({})));

  // left identity
  const t3 = S.concat(S.empty(Table), pure({a:1}));
  t.true(S.equals(t3, pure({a:1})));

  // right identity
  const t2 = S.concat(pure({a:1}), S.empty(Table));
  t.true(S.equals(t2, t3));

  t.true(Monoid.test(t2));
});

test('Table#concat should put o at the bottom of the prototype chain', t => {
  const t1 = pure({a:1,b:2});
  const t2 = pure({b:3,c:4});
  const t3 = pure({c:5,d:6});

  // associativity
  const t4 = S.concat(t3, S.concat(t2, t1));
  const t5 = S.concat(S.concat(t3, t2), t1);
  t.true(S.equals(t4, t5));

  t.true(Semigroup.test(t5));
});

test('Table#map transforms all entries leaving the original untouched', t => {
  const t1 = pure({a:1,b:2,c:3});
  const t2 = S.map(x => x + 1, t1);

  t.true(S.equals(t2, pure({a:2, b:3, c:4})));

  // identity
  t.true(S.equals(S.map(S.I, t2), t2));

  // composition
  const pow5 = S.curry2(Math.pow)(5);
  const t4 = S.map(S.compose(S.inc, pow5))(t2);
  const t5 = S.compose(S.map(S.inc), S.map(pow5))(t2);
  t.true(S.equals(t4, t5));

  t.true(Functor.test(t2));
});

test('Table#reduce', t => {
  const t1 = pure({a:1,b:2,c:3});
  console.log('t1', t1)
  const o1 = S.reduce((a, [k,v]) => Object.assign(a,{[k]:v}), Object.create(null), t1);
  // t.deepEqual(o1, S.extract(t1));

  //associativity
  const f = (x, [k, v]) => x + v;
  const v1 = S.reduce_(f, 0, t1);
  t.is(v1, 6);

  t.true(Foldable.test(t1));
});

test('Table#ap applies the function in t to the table', t => {
  const u = pure(S.curry2(Math.pow)(5));
  const v = pure(S.inc);
  const w = pure(2);
  const t3 = S.ap(v, w);
  const lhs = S.ap(u, t3);

  // composition
  const t5 = S.map(S.compose, u);
  const t6 = S.ap(t5, v);
  const rhs = S.ap(t6, w);
  t.true(S.equals(lhs, rhs));

  t.true(Apply.test(lhs));
});

test('Table#extend applies the function f the table', t => {
  const t1 = S.concat(pure({a:4}), pure({a:1,b:2,c:3}));
  const t2 = S.extend(t => ({b: t.get('a')}), t1);
  t.true(S.equals(t2, pure({b:1})));

  // associativity
  const w = pure({a:1});
  const f = t => t.get();
  const g = t => t.get('a');

  const t3 = S.compose(S.extend(f), S.extend(g))(w);
  const t4 = S.extend(S.compose(f, S.extend(g)), w);

  t.true(S.equals(t3, t4));

  t.true(Extend.test(t2));
});

test('Table#get should return the value mapped to; undefined otherwise', t => {
  const t1 = pure({a:1}).append({b:2}).append({c:3});
  t.is(t1.get('a'), 1);
  t.is(t1.get('b'), 2);
  t.is(t1.get('c'), 3);
  t.is(t1.get('d'), undefined);
  t.is(t1.get(), undefined);

  const t2 = S.concat(pure(4), pure({a:1,b:2,c:3}));
  t.is(t2.get('d'), 4);
  t.is(t2.get(), 4);
});

test('Tables can handle default Object properties', t => {
  const props = [
    ['__proto__', 1],
    ['__defineGetter__', 2],
    ['__defineSetter__', 3],
    ['__lookupGetter', 4],
    ['__lookupSetter', 5],
    ['constructor', 6],
    ['hasOwnProptery', 7],
    ['isPrototypeOf', 8],
    ['propertyIsEnumerable', 9],
    ['toLocaleString', 10],
    ['toString', 11],
    ['valueOf', 12]
  ];

  const o = Table.from(props);
  props.forEach(([k,v]) => t.is(o.get(k), v));
});
