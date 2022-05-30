import { ODataFilter } from './odata-filter';
/**
 * BUILT-IN {@type ODataFilter} implementation eq filter
 * {@deprecated will be eliminated in version 14 use ODataContainsFilter instead}
 */
export class SimpleFilter implements ODataFilter {
  filter_expression: any;

  public constructor(private readonly column: string) {
    this.filter_expression = null;
  }

  getFilter(): object {
    const filter: any = {};

    filter[this.column] = this.filter_expression;

    return filter;
  }
}
