/*
 * @author: Abhishek sah
 * Checksum for validate ISBN-10 and ISBN-13.
 */

const checksum = (isbn) => {
  //Remove last digit (control digit):
  let number = isbn.slice(0, -1);

  //Convert number to array (with only digits):
  number = number.split("").map(Number);

  //Save last digit (control digit):
  const last = isbn.slice(-1);
  const lastDigit = parseInt(last, 10);

  if (isbn.length === 10) {
    return checksumISBN10(number, lastDigit);
  } else if (isbn.length === 13) {
    return checksumISBN13(number, lastDigit);
  } else {
    return false;
  }
};

const checksumISBN10 = (number, lastDigit) => {
  //Algorithm for checksum calculation (digit * position):
  number = number.map((digit, index) => {
    return digit * (index + 1);
  });

  //Calculate checksum from array:
  const sum = number.reduce((a, b) => a + b, 0);
  //   console.log(sum);

  //Validate control digit:
  const controlDigit = (11 - (sum % 11)) % 11;
  //   console.log(controlDigit);
  const isValidISBN = lastDigit === controlDigit;
  //   console.log(isValidISBN);
  return isValidISBN; // not sure it works in isbn 13
};

//13
const checksumISBN13 = (number, lastDigit) => {
  //Algorithm for checksum calculation (digit * position):
  //   console.log(number);
  number = number.map((digit, index) => {
    // console.log(index);
    // console.log(digit);
    const multiple = digit * (index % 2 === 0 ? 1 : 3);
    return multiple;
  });
  //   console.log(number);

  //Calculate checksum from array:
  const sum = number.reduce((a, b) => a + b, 0);
  //   console.log(sum);

  //Validate control digit:
  const controlDigit = (10 - (sum % 10)) % 10;
  //   console.log(controlDigit);
  const isValidISBN = lastDigit === controlDigit;
  //   console.log(isValidISBN);
  return isValidISBN; // not sure it works in isbn 13
};

console.log(checksum("9783161484100"));
module.exports.checksum = checksum;
