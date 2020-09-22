import 'mocha';
import { expect } from 'chai';
import { chunk } from '../src/services/utility/Chunk';

describe('Utility function testing', () => {
  it('Should return [] if passed blank array', (done) => {
    expect(chunk([1, 2], 0)).to.eql([1, 2]);
    done();
  });

  it('Should return correct chunk result', (done) => {
    expect(chunk([1, 2], 2)).to.eql([[1, 2]]);
    done();
  });

  it('Should return correct chunk result', (done) => {
    expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 3)).to.eql([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8],
    ]);
    done();
  });
});
