import {ep} from '../core/ApiEndpoint';

export const MapEP = {
  Search: ep('GET', 'maps/search'),
  Detail: ep('GET', 'maps/detail'),
} as const;
