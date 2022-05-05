# PQS ANGUALR MATERIAL EXTRAS

Collection of componentas that adds extra functionality to [angular material](https://material.angular.io)

## ODATA - DATASOURCE

Implementation of [CDK's DataSource](https://material.angular.io/cdk/collections/api#DataSource) that can work with ODATA version 4. It supports sorting with `mat-sort` and pagination with `mat-paginator` as well as per column filtering. Based on [Marcin Suty's odata-data-source](https://github.com/relair/odata-data-source)





## MAT-SELECT-FILTER

Child component of [angular material select ](https://material.angular.io/components/select) that allows to filter from a data source.

- `MatSelectFilterDataSource` : Abstract data data source for `mat-select-filter`. Implement it for custom datasrouce
- `MatSelectFilterODataSource` : Abstract ODATA data source for `mat-select-filter` . Implement it for custom filtering
- `MatSelectFilterFastODataSource`: Simple implementation of `MatSelectFilterODataSource` 
  - `filterProperty`: The datasource will filter the input text with this property. **NESTED OBJECTS PROPERTIES ARE NOT SUPPORTED**
  - `keyProperty` : Used to set the value of the control. **NESTED OBJECTS PROPERTIES ARE NOT SUPPORTED**
- 
- Custom implementation

## MAT-SELECT INTINITE SCROLL

Adds missing infinite scroll functionality for the [angular material select component](https://material.angular.io/components/select).

Based on [HaidarZ/ng-mat-select-infinite-scroll](https://github.com/HaidarZ/ng-mat-select-infinite-scroll)

### Inputs

| Property       | Description                                                                                                                                                                                                                                                                                                              | Type      | Default |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------- |
| `complete`     | If `true`, the `infiniteScroll` output will no longer be triggered                                                                                                                                                                                                                                                       | `boolean` | `false` |
| `threshold`    | The threshold distance from the bottom of the options list to call the `infiniteScroll` output event when scrolled. The threshold value can be either in percent, or in pixels. For example, use the value of `10%` for the `infiniteScroll` output event to get called when the user has needs 10% to reach the bottom. | `string`  | `'15%'` |
| `debounceTime` | The threshold time before firing the `infiniteScroll` event                                                                                                                                                                                                                                                              | `number`  | `150`   |

### Outputs

| Property         | Description                                                                     | Type                 |
| ---------------- | ------------------------------------------------------------------------------- | -------------------- |
| `infiniteScroll` | Emitted when the scroller inside the `mat-select` reaches the required distance | `EventEmitter<void>` |

## Installation

WIP

## Compatibility

WIP
