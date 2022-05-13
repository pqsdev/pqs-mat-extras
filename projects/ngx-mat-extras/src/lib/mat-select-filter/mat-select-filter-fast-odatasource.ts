import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { isArray } from 'lodash';
import { MatSelectFilterODataSource } from './mat-select-filter-odatasource';

/**
 * Simple implementation of @type MatSelectFilterODataSource
 */
export class MatSelectFilterFastODataSource<
  T
> extends MatSelectFilterODataSource<T> {
  /**
   *
   * @param httpClient http client
   * @param initUrl initial valui of base url
   * @param debounceMillis debouce
   * @param isEnabled enabled initia lvalue
   * @param filterProperty The data source will filter the input text with this property. **NESTED OBJECTS PROPERTIES ARE NOT SUPPORTED**
   * @param keyProperty Used to set the value of the control. **NESTED OBJECTS PROPERTIES ARE NOT SUPPORTED**
   */
  constructor(
    httpClient: HttpClient,
    initUrl: string = '',
    debounceMillis = 0,
    isEnabled = true,
    private readonly filterProperty: string | string[],
    private readonly keyProperty: string
  ) {
    super(httpClient, initUrl, debounceMillis, isEnabled);
  }
  /**
   * Generates the following filter (keyProperty !=id ) AND (
   *  toLower(filterProperties[0]).contains(searchText)
   *  OR toLower(filterProperties[1]).contains(searchText)
   * ..
   * OR toLower(filterProperties[n]).contains(searchText)
   * )
   * @param text Text search
   * @param key Selected Id search
   * @returns ODataFilter
   */
  txtFilterMap(text: string, key: any) {
    let filters: { and: any[] } = {
      and: [],
    };

    let textSearch = (text || '').toLowerCase();

    if (this.filterProperty && textSearch) {
      if (!isArray(this.filterProperty)) {
        let filt: any = {};

        filt['tolower(' + this.filterProperty + ')'] = {
          contains: textSearch,
        };

        filters.and.push(filt);
      } else {
        // las filter properties se analizan como OR
        let textFilter: { or: any[] } = {
          or: [],
        };

        this.filterProperty.forEach((property) => {
          let filt: any = {};

          filt['tolower(' + property + ')'] = {
            contains: textSearch,
          };
          textFilter.or.push(filt);
        });
        filters.and.push(textFilter);
      }
    }

    // excluye el id por que lo trae la consulta de ID (para que no duplique)
    if (this.keyProperty && key) {
      let filt: any = {};
      filt[this.keyProperty] = {
        ne: key,
      };
      filters.and.push(filt);
    }
    return filters;
  }

  idFilterMap(key: any) {
    let filters: any = {};

    if (this.keyProperty && key) {
      filters[this.keyProperty] = key;
    }
    return filters;
  }

  setSelectedData(key: any): void {
    this.idFilter = key;
  }
}
