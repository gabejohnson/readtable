import test from 'ava';

import { Apply, Foldable, Applicative, Functor, Semigroup, Monoid } from 'sanctuary-type-classes';

import Table from '../src/table';


test('Constructor should return an instance derived from the input', t => {
  const o = new Table({a:1});
  t.is(o.get('a'), 1);
});

test('Table.of should return the same thing as the constructor', t => {
  const table = Table.of({a:1});
  t.deepEqual(table, new Table({a:1}));

  t.true(Applicative.test(table));
});

test('Table.empty should return an empty table', t => {
  const t1 = Table.empty();
  t.deepEqual(t1.extract(), {});

  const t2 = Table.empty().concat(Table.of({a:1}));
  const t3 = Table.of({a:1}).concat(Table.empty());

  t.deepEqual(t2.extract(), t3.extract());

  t.true(Monoid.test(t2));
});

test('Table#concat should put o at the bottom of the prototype chain', t => {

  const t1 = Table.of({a:1,b:2});
  const t2 = Table.of({b:3,c:4});
  const t3 = Table.of({c:5,d:6});
  const t4 = t1.concat(t2).concat(t3);
  const t5 = t1.concat(t2.concat(t3));

  t.deepEqual(t5.extract(), t4.extract());

  t.true(Semigroup.test(t5));
});

test('Table#map transforms all entries leaving the original untouched', t => {
  const t1 = Table.of({a:1,b:2,c:3});
  const t2 = t1.map(x => x + 1);

  t.deepEqual(t2.extract(), {a:2, b:3, c:4});

  t.true(Functor.test(t2));
});

test('Table#reduce applies a function to each property', t => {
  const t1 = Table.of({a:1,b:2,c:3}).concat(Table.of({a:4}));
  const o = t1.reduce((acc, o) => Object.assign(acc,o), Object.create(null));
  t.deepEqual(o, t1.extract());

  t.true(Foldable.test(t1));
});

test('Table#ap applies the function in t to the table', t => {
  const t1 = Table.of({a:1,b:2,c:3}).concat(Table.of({a:4}));
  const t2 = Table.of(x => x).concat(Table.of(x => x*x));
  const t3 = t1.ap(t2);

  t.deepEqual(t3.extract(), {a:16,b:4,c:9});

  t.true(Apply.test(t3));
});

// test('Table#append should add properties of o to the table', t => {
//   const t1 = Table.of({b:2}).append({a:1});
//   t.deepEqual(t1.extract(), obj);
// });

test('Table#get should return the value assigned to \'k\' anywhere down the prototype chain', t => {
  const t1 = Table.of({a:1}).append({b:2}).append({c:3});
  t.is(t1.get('a'), 1);
  t.is(t1.get('b'), 2);
  t.is(t1.get('c'), 3);
  t.is(t1.get('d'), undefined);
  t.is(t1.get(), undefined);

  const t2 = Table.of({a:1,b:2,c:3}).concat(Table.of(4));
  t.is(t2.get('d'), 4);
  t.is(t2.get(), undefined);
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
