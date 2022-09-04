import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();

interface Route {
    color: string;
    name: string;
}

let routes: { [key: string]: Route };

async function getData() {
    const url = `${config.apiBaseUrl}/gtlservice/routes?areas=23`;
    console.log(`Requesting ${url}`);
    const resp = await fetch(url, {
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${config.apiUsername}:${config.apiPassword}`).toString('base64'),
        },
    });
    return resp.json();
}

async function loadRoutes() {
    if (routes) return;
    const data = await getData();
    routes = {};
    for (const route of data) {
        routes[route['routeId']] = {
            color: '#' + route['routeColor'],
            name: route['routeShortName'],
        };
    }
}

function getRoute(routeId: string): Route {
    return routes[routeId];
}

export { getRoute, loadRoutes };