// Esto se guardo en un snippet con el comando: micro-envs

import 'dotenv/config';
import * as joi from 'joi';

//valida que el puerto sea un numero
interface EnvVars{
    PORT: number;
    DATABASE_URL: string;
}

// El puerto tiene que ser obligatorio

const envSchema = joi.object({

    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
})
.unknown(true);

// desestructura esas variables del .env
const { error, value } = envSchema.validate( process.env );

//creacion del mensaje de error
if(error){
    throw new Error(`Config validation error: ${error.message}`);
}

//cambia tipo de dato de any a number
const envVars: EnvVars = value;

//variables globales del puerto y db
export const envs ={
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,

}