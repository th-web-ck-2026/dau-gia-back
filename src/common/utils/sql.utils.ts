const operatorMap = {
  'Symbol(eq)': '=',
  'Symbol(ne)': '!=',
  'Symbol(gte)': '>=',
  'Symbol(gt)': '>',
  'Symbol(lte)': '<=',
  'Symbol(lt)': '<',
  'Symbol(in)': 'IN',
  'Symbol(notIn)': 'NOT IN',
  'Symbol(like)': 'LIKE',
  'Symbol(iLike)': 'ILIKE',
};

export function buildWhereClause(
  condition: any,
  tableName: string,
): { whereClause: string; replacements: any } {
  const whereClauses: string[] = [];
  const replacements: any = {};

  if (!condition || Object.keys(condition).length === 0) {
    return { whereClause: '', replacements: {} };
  }

  Object.keys(condition).forEach((key) => {
    const value = condition[key];
    if (value !== undefined && value !== null) {
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        const operatorSymbol = Object.getOwnPropertySymbols(value)[0];

        if (operatorSymbol) {
          const sqlOperator = operatorMap[operatorSymbol.toString()];
          const actualValue = value[operatorSymbol];

          if (sqlOperator) {
            const paramName = `${key}_${Math.random()
              .toString(36)
              .substring(7)}`;
            if (sqlOperator === 'IN' || sqlOperator === 'NOT IN') {
              whereClauses.push(
                `${tableName}."${key}" ${sqlOperator} (:${paramName})`,
              );
              replacements[paramName] = actualValue;
            } else {
              whereClauses.push(
                `${tableName}."${key}" ${sqlOperator} :${paramName}`,
              );
              replacements[paramName] = actualValue;
            }
          }
        }
      } else {
        const paramName = `${key}_${Math.random().toString(36).substring(7)}`;
        whereClauses.push(`${tableName}."${key}" = :${paramName}`);
        replacements[paramName] = value;
      }
    }
  });

  return {
    whereClause: whereClauses.join(' AND '),
    replacements,
  };
}
