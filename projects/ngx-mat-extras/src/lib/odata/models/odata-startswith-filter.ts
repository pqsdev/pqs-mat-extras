import { ODataFilter } from './odata-filter';
/**
 * BUILT-IN {@type ODataFilter} implementation contains filter
 * {@deprecated will be eliminated in version 14 use ODataContainsFilter instead}
 */
export class ODataStartsWithFilter implements ODataFilter {
  filter_expression: string;

  /**
   *
   * @param column
   * @param caseSensitive
   * @deprecated user {@type ODataContainsFilter} instead
   */
  public constructor(
    private readonly column: string,
    private readonly caseSensitive = false
  ) {
    this.filter_expression = '';
  }

  getFilter(): object {
    const filter: any = {};

    if (this.caseSensitive)
      filter[this.column] = { contains: this.filter_expression };
    else
      filter[`tolower(${this.column})`] = {
        contains: this.filter_expression.toLowerCase(),
      };

    return filter;
  }
}
