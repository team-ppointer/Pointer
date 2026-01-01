export const toAlphabetSequence = (num: number) => {
  let result = '';
  let n = num;

  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }

  return result;
};
