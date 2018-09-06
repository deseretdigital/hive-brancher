const constants = [
  'LOAD_WHITELIST',
  'SAVE_WHITELIST',
  'SET_WHITELIST',
  'LOAD_BRANCHES',
  'SET_BRANCHES'
];
const constantsObj = {};
constants.forEach(constant => {
    constantsObj[constant] = constant;
});
export default constantsObj;
