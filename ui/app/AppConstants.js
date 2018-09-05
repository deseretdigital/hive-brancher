const constants = [
  'LOAD_WHITELIST',
  'SAVE_WHITELIST',
  'SET_WHITELIST'
];
const constantsObj = {};
constants.forEach(constant => {
    constantsObj[constant] = constant;
});
export default constantsObj;
