import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import LandingPage from './pages/landing';
import PublicCalculator from './pages/public-calculator';
import { calculators } from './lib/public-calculators';

export function renderPublicPages() {
  return [
    { path: '/', html: renderToStaticMarkup(<StaticRouter location="/"><LandingPage /></StaticRouter>) },
    ...calculators.map(calculator => ({
      path: calculator.path,
      title: calculator.title + ' | Atten-Dance',
      description: calculator.description,
      html: renderToStaticMarkup(<StaticRouter location={calculator.path}><PublicCalculator calculator={calculator} /></StaticRouter>),
    })),
  ];
}
