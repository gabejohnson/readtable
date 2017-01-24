// @flow

import { getCurrentReadtable, setCurrentReadtable } from '../src/reader';
import Readtable, { EmptyReadtable } from '../src/readtable';
import test from 'ava';

test('getCurrentReadtable should return the current readtable',
     t => t.true(getCurrentReadtable() instanceof Readtable));

test('setCurrentReadtable should set the current readtable', t => {
  const table = getCurrentReadtable();
  t.true(table !== EmptyReadtable);
  setCurrentReadtable(EmptyReadtable);
  t.true(getCurrentReadtable() === EmptyReadtable);
  setCurrentReadtable(table);
  t.true(getCurrentReadtable() === table);
});
