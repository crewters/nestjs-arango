import { Inject } from '@nestjs/common';
import { Model } from 'arangoose';

export const InjectModel = (Model: string) => Inject(`ARANGO_MODEL_${Model}`);