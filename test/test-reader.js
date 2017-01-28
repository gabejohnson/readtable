// @flow

import Reader, { getCurrentReadtable, setCurrentReadtable } from '../src/reader';
import CharStream from '../src/char-stream';
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

test('Reader#read uses the correct action', t => {
  const currTable = getCurrentReadtable();
  const newTable = currTable.extend({
    key: 'x',
    mode: 'non-terminating',
    action(stream) {
      const [x,y,z] = [stream.readString(), stream.readString(), stream.readString()];
      t.deepEqual([x,y,z], ['x', 'y', 'z']);
    }
  });

  const stream = new CharStream('xyz');
  const reader = new Reader();

  setCurrentReadtable(newTable);
  reader.read(stream);
  setCurrentReadtable(currTable);
});
