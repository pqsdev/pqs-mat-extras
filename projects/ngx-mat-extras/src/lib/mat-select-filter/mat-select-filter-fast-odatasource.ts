import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
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
    private readonly filterProperty: string,
    private readonly keyProperty: string
  ) {
    super(httpClient, initUrl, debounceMillis, isEnabled);
  }

  txtFilterMap(text: string, key: any) {
    let filters: { and: any[] } = {
      and: [],
    };

    if (this.filterProperty) {
      let filt: any = {};

      filt['tolower(' + this.filterProperty + ')'] = {
        contains: (text || '').toLowerCase(),
      };

      filters.and.push(filt);
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
