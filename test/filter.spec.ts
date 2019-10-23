import { resolve } from 'path';
import { include } from '../src/filter';

describe('Filter Test', () => {
    it('include test', () => {
        const rs = include(
            resolve(__dirname, './assert/exclude-define.js'),
            ['*.js'],
            resolve(__dirname, './assert'));
        expect(rs).toBe(true);
    });

    it('include test', () => {
        const rs = include(
            'exclude-define.js',
            ['*.js']
        );
        expect(rs).toBe(true);
    });
});
