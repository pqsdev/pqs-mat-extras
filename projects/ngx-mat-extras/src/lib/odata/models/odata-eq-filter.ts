import { ODataFilter } from './odata-filter';
/**
 * BUILT-IN {@type ODataFilter} implementation of eq filter
 */
export class ODataEqFilter implements ODataFilter {
  filter_expression: string | number | null;

  /**
   * Creates a new instance of the class {@type ODataContainsFilter}
   * @param column a string with a columna name or array of string with columns names
   * @param isNumeric if the value of the filter is numeric
   * @param operation the operation to join if there are multiple columns
   */
  public constructor(
    private readonly column: string[] | string,
    private readonly operation: 'and' | 'or' = 'or'
  ) {
    this.filter_expression = null;
  }
  /**
   * Return teh filter data
   * @returns a and u or expression (depending on {@see ODataContainsFilter.operation }) with te columns specificed in {@see ODataContainsFilter.column }
   */
  getFilter(): object {
    if (!this.filter_expression) return {};

    const filters: any[] = [];

    let columns: string[];

    if (Array.isArray(this.column)) {
      columns = this.column;
    } else {
      columns = [this.column];
    }

    columns.forEach((column) => {
      let filter: any = {};
      filter[column] = this.filter_expression;
      filters.push(filter);
    });

    if (this.operation == 'or') return { or: filters };
    else return { and: filters };
  }
}
