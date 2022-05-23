import { Filter } from 'odata-query';

/**
 * Implementit to get custom filters on the ODataSource
 */
export interface IODataFilter {
  /**
   * Must return a valid filter odata query https://github.com/techniq/odata-query#filtering
   * @param context
   */
  getFilter(context?: { txtSearch: string; idSearch: any }): Filter;
}
