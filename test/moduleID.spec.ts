/*
 * @Author: qiansc
 * @Date: 2019-04-29 13:05:35
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-04-29 13:24:47
 */
import { dirname, resolve } from 'path';
import { parseAbsolute, parseBase } from '../src/moduleID';

describe('Test ModuleID ./', () => {

  const moduleIDA = './A';
  const pwd = __dirname;
  let mAbsoluteA: string;
  let mAbsoluteB: string;

  it('parseAbsolute', () => {

    mAbsoluteA = parseAbsolute(pwd, moduleIDA);
    console.log(pwd, moduleIDA, '=>', mAbsoluteA);
    expect(mAbsoluteA).toBe(resolve(pwd, moduleIDA));
  });

  it('parseAbsolute', () => {
    mAbsoluteB = parseBase(pwd, mAbsoluteA);
    console.log(pwd, mAbsoluteA, '=>', mAbsoluteB);
    expect(mAbsoluteB).toBe('A');
  });

  it('parseAbsoluteWithFloder', () => {
    mAbsoluteB = parseBase(dirname(pwd), mAbsoluteA);
    console.log(dirname(pwd), mAbsoluteA, '=>', mAbsoluteB);
    expect(mAbsoluteB).toBe('test/A');
  });

});

describe('Test ModuleID ../', () => {

  const moduleIDA = '../A/QQ';
  const pwd = __dirname;
  let mAbsoluteA: string;
  let mAbsoluteB: string;

  it('parseAbsolute', () => {

    mAbsoluteA = parseAbsolute(pwd, moduleIDA);
    console.log(pwd, moduleIDA, '=>', mAbsoluteA);
    expect(mAbsoluteA).toBe(resolve(pwd, moduleIDA));
  });

  it('parseAbsolute', () => {
    mAbsoluteB = parseBase(pwd, mAbsoluteA);
    console.log(pwd, mAbsoluteA, '=>', mAbsoluteB);
    expect(mAbsoluteB).toBe(mAbsoluteA);
  });

  it('parseAbsoluteWithFloder', () => {
    mAbsoluteB = parseBase(dirname(pwd), mAbsoluteA);
    console.log(dirname(pwd), mAbsoluteA, '=>', mAbsoluteB);
    expect(mAbsoluteB).toBe('A/QQ');
  });

});

describe('Test ModuleID @scope/C', () => {

  const moduleIDA = '@scope/C';
  const pwd = __dirname;
  let mAbsoluteA: string;
  let mAbsoluteB: string;

  it('parseAbsolute', () => {

    mAbsoluteA = parseAbsolute(pwd, moduleIDA);
    console.log(pwd, moduleIDA, '=>', mAbsoluteA);
    expect(mAbsoluteA).toBe('@scope/C');
  });

  it('parseAbsolute', () => {
    mAbsoluteB = parseBase(pwd, mAbsoluteA);
    console.log(pwd, mAbsoluteA, '=>', mAbsoluteB);
    expect(mAbsoluteB).toBe('@scope/C');
  });

  it('parseAbsoluteWithFloder', () => {
    mAbsoluteB = parseBase(dirname(pwd), mAbsoluteA);
    console.log(dirname(pwd), mAbsoluteA, '=>', mAbsoluteB);
    expect(mAbsoluteB).toBe('@scope/C');
  });
});
