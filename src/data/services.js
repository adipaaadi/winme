// Fixed-price services. Every operator behind them is fictional, like the profiles.
export const services = [
  {
    id: 'mock-interview',
    title: 'Mock interview',
    description:
      'A live practice interview for the role you are going after, followed by direct feedback on what to keep and what to change.',
    price: 30,
    offeredBy: ['sofia-marchetti', 'marcus-bell', 'ingrid-kalnina'],
  },
  {
    id: 'cv-linkedin-walkthrough',
    title: 'CV and LinkedIn walkthrough',
    description:
      'A line-by-line read of your CV and LinkedIn profile, with the changes that make both clearer to a recruiter in under a minute.',
    price: 20,
    offeredBy: ['sofia-marchetti', 'marcus-bell', 'maija-ozola'],
  },
  {
    id: 'pitch-run-through',
    title: 'Pitch run-through',
    description:
      'A full run-through of your pitch, slide by slide, with honest notes on the story, the numbers and the questions investors will ask.',
    price: 40,
    offeredBy: ['tomas-lehtinen', 'rohan-mehta', 'elena-sorokina'],
  },
  {
    id: 'career-roadmap',
    title: 'Career roadmap',
    description:
      'A working session on where your career goes next: the options you have, what each one costs, and the next two or three moves worth making.',
    price: 25,
    offeredBy: ['maija-ozola', 'daniel-okafor', 'marcus-bell', 'nia-thompson'],
  },
  {
    id: 'ai-ml-project-review',
    title: 'AI/ML project review',
    description:
      'Bring a model, a project or a portfolio piece. We go through the problem, the choices you made and what a hiring manager or reviewer would ask next.',
    price: 30,
    offeredBy: ['priya-raghavan', 'nia-thompson', 'rohan-mehta', 'ingrid-kalnina'],
  },
  {
    id: 'product-case-practice',
    title: 'Product case practice',
    description:
      'Work through a product case out loud, then review how you structured it, what you missed and how to make the same answer stronger next time.',
    price: 30,
    offeredBy: ['daniel-okafor', 'elena-sorokina', 'tomas-lehtinen'],
  },
  {
    id: 'working-abroad-qa',
    title: 'Working abroad Q&A',
    description:
      'An honest conversation about moving and working abroad, from first jobs to settling in. General experience only, not legal or visa advice.',
    price: 20,
    offeredBy: ['sofia-marchetti', 'maija-ozola', 'marcus-bell'],
  },
];

export const GENERAL_ADVICE = 'General advice call';

export function getService(id) {
  return services.find((service) => service.id === id);
}

export function getServicesForExecutive(execId) {
  return services.filter((service) => service.offeredBy.includes(execId));
}
