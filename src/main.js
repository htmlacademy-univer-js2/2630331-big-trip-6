import Presenter from './presenter.js';
import PointsModel from './model/points-model.js';
import { generateMockData } from './mock/generator.js';

const model = new PointsModel();
const mockData = generateMockData();
model.initialize(mockData);

const presenter = new Presenter(model);
presenter.init();
