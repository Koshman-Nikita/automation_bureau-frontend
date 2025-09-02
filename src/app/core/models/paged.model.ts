export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
