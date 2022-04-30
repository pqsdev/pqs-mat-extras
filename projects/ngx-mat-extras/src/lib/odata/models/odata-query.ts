// extracto de https://github.com/techniq/odata-query/blob/master/src/index.ts
type PlainObject = { [property: string]: any };
export type ODataQueryFilter =
  | string
  | PlainObject
  | Array<string | PlainObject>;
type NestedExpandOptions = {
  [key: string]: Partial<ExpandQueryOptions>;
};
type Expand =
  | string
  | NestedExpandOptions
  | Array<string | NestedExpandOptions>;
enum StandardAggregateMethods {
  sum = 'sum',
  min = 'min',
  max = 'max',
  average = 'average',
  countdistinct = 'countdistinct',
}
type Aggregate =
  | { [propertyName: string]: { with: StandardAggregateMethods; as: string } }
  | string;

interface ExpandQueryOptions {
  select?: string | string[];
  filter?: ODataQueryFilter;
  orderBy?: string | string[];
  top?: number;
  expand?: Expand;
}
interface Transform {
  aggregate?: Aggregate | Aggregate[];
  filter?: ODataQueryFilter;
  groupBy?: GroupBy;
}
interface GroupBy {
  properties: string[];
  transform?: Transform;
}
export interface QueryOptions extends ExpandQueryOptions {
  search?: string;
  transform?: PlainObject | PlainObject[];
  skip?: number;
  key?: string | number | PlainObject;
  count?: boolean | ODataQueryFilter;
  action?: string;
  func?: string | { [functionName: string]: { [parameterName: string]: any } };
  format?: string;
}
