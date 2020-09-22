import logo from 'asciiart-logo';
import { config } from 'dotenv-flow';
config();
console.log(
    logo({
        name: process.env.NAME,
        borderColor: 'grey',
        logoColor: 'blue',
        textColor: 'blue',
    })
        .emptyLine()
        .right(`version ${process.env.VERSION}`)
        .emptyLine()
        .center(`Support Requests - ${process.env.SUPPORT}`)
        .render(),
);
import './pxConfig'; // !!! always import after config()
