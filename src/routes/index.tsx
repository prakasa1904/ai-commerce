import { createFileRoute } from '@tanstack/react-router';
import HomePage from './home/-homePage';

export const Route = createFileRoute('/')({
  component: HomePage,
});