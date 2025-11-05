/**
 * Converte objetos de snake_case para camelCase
 * Útil para adaptar dados do Supabase para o frontend
 */

const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const convertKeysToCamel = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamel(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = snakeToCamel(key);
      result[camelKey] = convertKeysToCamel(obj[key]);
      return result;
    }, {});
  }

  return obj;
};

const convertKeysToSnake = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnake(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = convertKeysToSnake(obj[key]);
      return result;
    }, {});
  }

  return obj;
};

module.exports = {
  snakeToCamel,
  camelToSnake,
  convertKeysToCamel,
  convertKeysToSnake
};

