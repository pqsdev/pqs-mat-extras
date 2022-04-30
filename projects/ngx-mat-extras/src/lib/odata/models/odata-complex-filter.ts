import { ODataFilter } from './odata-filter';
import { ODataQueryFilter } from './odata-query';

export class ODataComplexFilter implements ODataFilter {
  /**
   * Crea un nuevo filtro de datos complejo
   * @param filter objeto conforma a lo que dice https://github.com/techniq/odata-query#filtering
   */
  public constructor(private readonly filter: ODataQueryFilter) {}

  getFilter(): any {
    return this.filter;
  }
}
