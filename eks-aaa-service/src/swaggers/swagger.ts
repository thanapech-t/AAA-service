import swaggerJSDoc from 'swagger-jsdoc';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { setup, serve } from 'swagger-ui-express';
import vaca from 'vaca';
import logo from 'asciiart-logo';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: process.env.NAME,
            description: `Reach out to us on microsoft team - ${process.env.SUPPORT}`,
            contact: {
                name: 'PageExpress',
            },
            version: process.env.VERSION,
        },
        externalDocs: {
            description: `git: ${process.env.REPO}`,
            url: process.env.REPO,
        },
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
    },
    apis: [
        /*
         * all file in
         * - "./src/controllers/*.ts" for dev mode
         * - "./controllers/*.js" for release mode
        */
        '**/swaggers/*.yaml',
        '**/controllers/*.+(j|t)s',
    ],
};

const swaggerConfig = swaggerJSDoc(options);
const uiOptions = {
    explorer: false,
    swaggerOptions: {
        filter: true,
        docExpansion: 'list',
        requestInterceptor: (req: any) => {
            const actulApiPath = req.url.split(window.location.host)[1];
            req.url = `${window.location.href.split('/swagger')[0]}${actulApiPath}`;
            return req;
        },

    },
};

const redirectHtml = () => {
  const option = {
      name: process.env.NAME,
      borderColor: 'grey',
      logoColor: 'blue',
      textColor: 'blue',
  };
  const px = logo(option)
      .emptyLine()
      .right(`version ${process.env.VERSION}`)
      .emptyLine()
      .center(`Support Requests - ${process.env.SUPPORT}`)
      .render();
  return `
<html>
  <body style="color: rgb(0, 90, 255);">
      <center>
      <pre>${px}</pre>
      <h3>.. Redirecting to Swagger here is some cow ..</h3>
      <span id="countdown"></span>
      <pre>${vaca()}</pre>
      </br>
      <pre>
      </center>
  </body>
  <script type="text/javascript">
      window.onload = () => {
          var redirectInterval = 4000;
          var stepInterval = 1000;
          var step = redirectInterval / stepInterval;
          document.getElementById('countdown').innerHTML = step;
          setInterval(() => {
              step = step - 1;
              document.getElementById('countdown').innerHTML = step;
          }, stepInterval);
          setTimeout(() => {
              window.location = window.location + '/';
          }, redirectInterval);
      }
  </script>
</html>
`;
};
const redirect = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.indexOf('swagger/') > -1) {
      next();
  } else {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.send(redirectHtml());
  }
};

export const swaggerJson = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerConfig);
};

const handlers = [redirect, serve, setup(swaggerConfig, uiOptions)];
export const swaggerRoute: RequestHandler[] = [].concat.apply([], handlers);
