//Expression
function Expression() {
  this._expression = '';
}

const proto = Expression.prototype;

proto.and = function(field, value) {
    this._expression = this._expression ? this._expression + ' AND ': this._expression;
    if (field && value) {
      this.eq(field, value);
    }
    return this;
};

proto.or = function() {
  if (field && value) {
    this._expression = this._expression ? this._expression + ' OR ' : this._expression;
    this.eq(field, value);
  }
  return this;
};

proto.eq = function (field, value) {
  this._expression = this._expression + this._build('eq', field, value);
  return this;
};

proto.like = function(field, value) {
  this._expression = this._expression + this._build('LIKE', field, value);
  return this;
};

proto.ilike = function(field, value) {
  this._expression = this._expression + this._build('ILIKE', field, value);
  return this;
};

proto.not = function(field, value) {
  this._expression = this._expression + this._build('NOT', field, value);
  return this;
};

proto.gt = function(field, value) {
  this._expression = this._expression + this._build('gt', field, value);
  return this;
};

proto.gte = function(field, value) {
  this._expression = this._expression + this._build('gte', field, value);
  return this;
};

proto.lt = function(field, value) {
  this._expression = this._expression + this._build('lt', field, value);
  return this;
};

proto.lte = function(field, value) {
  this._expression = this._expression + this._build('lte', field, value);
  return this;
};

proto.clear = function() {
  this._expression = '';
  return this;
};

// get expression method to get the realt value of the expression
proto.get = function() {
  return this._expression;
};

proto._build = function(operator, field, value) {
  return [field, Expression.OPERATORS[operator], value].join(' ')
};

proto.createExpressionFromFilter = function(filterObject, layername) {
  function createSingleFilter(booleanObject) {
    let filterElements = [];
    let rootFilter;
    for (const operator in booleanObject) {
      rootFilter = Expression.OPERATORS[operator];
      const inputs = booleanObject[operator];
      inputs.forEach((input) => {
        for (const operator in input) {
          const value = input[operator];
          if (Array.isArray(value)) {
            filterElement = createSingleFilter(input);
          } else {
            const valueExtra = (operator === 'LIKE' || operator === 'ILIKE')  ? "%": "";
            filterOp = Expression.OPERATORS[operator];
            for (const operator in input) {
              const field = input[operator];
              for (const name in field) {
                const value = field[name];
                if ((value !== null && value !== undefined) && !(Number.isNaN(value) || !value.toString().trim())) {
                  const filterElement = `"${name}" ${filterOp} '${valueExtra}${value}${valueExtra}'`;
                  filterElements.push(filterElement);
                }
              }
            }
          }
        }
      });
      rootFilter = (filterElements.length > 0) ? filterElements.join(" "+ rootFilter + " ") : false;
    }
    return rootFilter;
  }

  const filter = createSingleFilter(filterObject);
  if (filter)
    this._expression = `${layername}:${filter}`;
  return this
};

// map object between operator
Expression.OPERATORS = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '=<',
  LIKE: 'LIKE',
  ILIKE: 'ILIKE',
  AND: 'AND',
  OR: 'OR',
  NOT: '!='
};

module.exports = Expression;
