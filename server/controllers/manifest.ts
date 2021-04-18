import express from 'express';

import { IdentifiedRequest, RoutesDescriptor } from './routes';
import { Setting } from '../models';

export async function getManifest(req: IdentifiedRequest<any>, res: express.Response) {
    const iconsDirectory = 'favicon/';
    const scope = process.kresus.urlPrefix;
    const { id: userId } = req.user;
    // Eslint does not like camel_case keys in the JSON
    /* eslint-disable */
    res
        .status(200)
        .contentType('application/manifest+json')
        .json({
            name: 'Kresus',
            short_name: 'Kresus',
            description: 'Your personal finances manager',
            lang: await Setting.getLocale(userId),
            start_url: scope,
            scope,
            display: 'fullscreen',
            theme_color: '#303641',
            icons: [
                {
                    src: `${iconsDirectory}favicon-16x16.png`,
                    sizes: '16x16',
                    type: 'image/png',
                    density: 0.75
                },
                {
                    src: `${iconsDirectory}favicon-32x32.png`,
                    sizes: '32x32',
                    type: 'image/png',
                    density: 0.75
                },
                {
                    src: `${iconsDirectory}favicon-48x48.png`,
                    sizes: '48x48',
                    type: 'image/png',
                    density: 1
                },
                {
                    src: `${iconsDirectory}favicon-96x96.png`,
                    sizes: '96x96',
                    type: 'image/png',
                    density: 2
                },
                {
                    src: `${iconsDirectory}favicon-144x144.png`,
                    sizes: '144x144',
                    type: 'image/png',
                    density: 3
                },
                {
                    src: `${iconsDirectory}favicon-192x192.png`,
                    sizes: '192x192',
                    type: 'image/png',
                    density: 4
                }
            ]
        });
    /* eslint-enable */
}

const routes: RoutesDescriptor = {
    manifest: {
        get: getManifest,
    },
};

export default routes;
