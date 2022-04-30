import { ODataFilter } from './odata-filter';

export class ODataStartsWithFilter implements ODataFilter {
  filter_expression: string;

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
