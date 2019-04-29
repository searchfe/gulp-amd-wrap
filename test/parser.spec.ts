import { readFileSync } from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import { Parser } from '../src/parser';

const root = __dirname;
const filePath = path.resolve(root, './assert/minify-define.js');
const content = readFileSync(filePath);

const parser = new Parser(content, filePath, root);

parser.hook();
