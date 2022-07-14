# ISBN-10 and ISBN-13 Validation

To install using npm -

`npm install isbn-validation`

To install using yarn -

`yarn add isbn-validation`




To use this, first import the `checksum()` function from 'isbn-validation', like this - 

```javascript
import {checksum} from 'isbn-validation'
```

The Function takes one input, i.e., the ISBN-10 or ISBN-13 in string format 

> Note: Make Sure the isbn is a string.

```js
checksum("9789387779464") //isbn-13
checksum("0756603390") //isbn-10
```