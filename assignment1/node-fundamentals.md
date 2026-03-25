# Node.js Fundamentals

## What is Node.js?

It is a JS framework that allows for backend server side development. Including but not limited to file management, operating system information access, and TCP sockets

## How does Node.js differ from running JavaScript in the browser?

Direct access to fs and os
HTTP/HTTPS
Low leveloperating system tasks

## What is the V8 engine, and how does Node use it?

It is what Node is build on. V8 compiles javascript diffrently than other engines. Im not sure what it does exactly, but it seems cleaver.
#justInTime?

## What are some key use cases for Node.js?

Server to server communication, read/write/process files, and chunck streaming data on larger files

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

Its the import.export syntax
**CommonJS (default in Node.js):**

```js
const something = require('./path/to/something')
modules.export = function something()
```

**ES Modules (supported in modern Node.js):**

```js
import {somthing} from './path'; || import something from './path';
export function something(); || export default function something();
```
