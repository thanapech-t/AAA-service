import vaca from 'vaca';
import logo from 'asciiart-logo';
import { Request, Response, NextFunction } from 'express';
import { OK } from 'http-status-codes';

const renderBranding = (renderHtml: boolean = false) => {
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
  if (renderHtml) {
    return `
<html data-service-name="${process.env.NAME}">
    <body style="color: rgb(0, 90, 255);">
        <center>
        <pre>${px}</pre>
        <h3 style="color: #666666;">This is internal PageExpress micro service</h3>
        <span>[ please see some cow instead ]</span>
        <pre>${vaca()}</pre>
        </br>
        <a href="./swagger/" style="text-decoration: none; color: inherit;">[ > go to swagger ]</a>
        </center>
    </body>
</html>
        `;
  } else {
    return `
${px}
    service: ${process.env.NAME}
    note:     This is internal PageExpress micro service

    [ please see some cow instead ]

${vaca()}
`;
  }
};

export const landing = (req: Request, res: Response, next: NextFunction) => {
  const acceptHtml =
    req.headers && req.headers.accept
      ? req.headers.accept.indexOf('text/html') > -1
      : false;
  if (acceptHtml) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(OK).send(renderBranding(true));
  } else {
    res.setHeader('Content-Type', 'text/plain; charset=ascii');
    res.status(OK).send(renderBranding(false));
  }
};
