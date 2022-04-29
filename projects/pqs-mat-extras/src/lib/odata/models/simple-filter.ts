import { ODataFilter } from './odata-filter';

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
