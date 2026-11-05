// Landing pages of lab projects: maps a project id from config/lab.js (`detail: 'landing'`) to its
// component. To add one, create the component in this folder and register it below under the
// project's id.
//
// A landing component receives `project` (its entry in config/lab.js) and renders the page's content;
// the header and footer come from the site. Title and description for search engines are the card's
// texts (`Lab.projects.<id>`); the page's own texts live in the messages, e.g. under `LabLandings.<id>`.
//
// All project pages share one route (app/[locale]/lab/[slug]), so client code imported here directly is
// loaded on every project page. A landing with a heavy interactive part (a 3D scene, a chart library, …)
// should load that part with next/dynamic from a small client component ('use client'); it then gets its
// own chunk, loaded only on the page that renders it, and is still rendered on the server.
import ScrollGradient from './ScrollGradient';

export const landingComponents = {
    'scroll-gradient': ScrollGradient,
};
