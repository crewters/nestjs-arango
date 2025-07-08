import { Inject } from '@nestjs/common';
import { ARANGO_CONNECTION } from '../arango.constants';

export const InjectConnection = () => Inject(ARANGO_CONNECTION);