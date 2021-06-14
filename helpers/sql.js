const { BadRequestError } = require("../expressError");

/** Partial update of user data.
 * 
 * This function helps in partial update of data with the data received 
 * from the request body. 
 * 
 * If there are zero keys it throws an error
 * 
 * cols is achieved by mapping through the keys 
 * 
 * and finally returns an Object with setCols holding the keys and 
 * values holding the values of the data passed.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
