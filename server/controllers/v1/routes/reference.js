/**
 * API reference endpoint
 */
import selfapi from 'selfapi';

const reference = selfapi({
    title: 'API reference'
});
reference.get({
    title: 'Get the API documentation',
    handler: (request, response) => {
        var html = `
<!doctype html>
<html lang="en">
<head><link href="https://janitor.technology/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" type="text/css" href="https://janitor.technology/css/janitor.css"></head>
<body><section class="reference"><div class="container">
`;

        const rootAPI = reference.parent;
        if (rootAPI) {
            html += rootAPI.toHTML();
        } else {
            html += reference.toHTML();
        }
        html += '</div></section></body></html>';
        response.send(html);
    }
});

export default reference;
