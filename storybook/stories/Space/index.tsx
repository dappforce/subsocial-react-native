import React, { ReactNode } from 'react';
import Subsocial from '@subsocial/api';

import config from 'config.json'

export default function(): ReactNode {
  Subsocial.getApi(config.connections.ws.substrate).then((api) => {
    
  });
  return null;
}
