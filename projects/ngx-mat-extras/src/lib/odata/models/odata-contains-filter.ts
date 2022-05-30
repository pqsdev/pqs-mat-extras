import { ODataFilter } from './odata-filter';
/**
 * BUILT-IN {@type ODataFilter} implementation of contains filter
 */
export class ODataContainsFilter implements ODataFilter {
  filter_expression: string;

  /**
   * Creates a new instance of the class {@type ODataContainsFilter}
   * @param column a string with a column name or array of string with columns names
   * @param caseSensitive if the filter is case sensitive
   * @param operation the operation to join if there are multiple columns
   */
  public constructor(
    private readonly column: string[] | string,
    private readonly caseSensitive = false,
    private readonly operation: 'and' | 'or' = 'or'
  ) {
    this.filter_expression = '';
  }
  /**
   * Return teh filter data
   * @returns a and u or expression (depending on {@see ODataContainsFilter.operation }) with te columns specificed in {@see ODataContainsFilter.column }
   */
  getFilter(): object {
    const filters: any[] = [];

    let columns: string[];

    if (Array.isArray(this.column)) {
      columns = this.column;
    } else {
      columns = [this.column];
    }

    columns.forEach((column) => {
      let filter: any = {};

      if (this.caseSensitive)
        filter[column] = { contains: this.filter_expression };
      else
        filter[`tolower(${column})`] = {
          contains: this.filter_expression.toLowerCase(),
        };
      filters.push(filter);
    });

    if (this.operation == 'or') return { or: filters };
    else return { and: filters };
  }
}
