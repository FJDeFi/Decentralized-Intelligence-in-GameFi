const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({
  path: envPath,
});

const Joi = require('joi');

const configSchema = Joi.object({
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  alchemyApiKey: Joi.string().allow(''),
  PRIVATE_KEY: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required(),
  CONTRACT_ADDRESS: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required(),
  MAX_GAS_LIMIT: Joi.number().default(6000000),
  MAX_RETRIES: Joi.number().default(3),
  REQUEST_TIMEOUT: Joi.number().default(10000),
  DATABASE_URL: Joi.string().default('mongodb://localhost:27017/gamefi_dev'),
  // Add other configurations as needed
});

const { error, value: envVars } = configSchema.validate(process.env, {
  allowUnknown: true,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const validatedConfig = {
  port: envVars.PORT || 5001,
  nodeEnv: envVars.NODE_ENV,
  privateKey: envVars.PRIVATE_KEY,
  contractAddress: envVars.CONTRACT_ADDRESS,
  maxGasLimit: envVars.MAX_GAS_LIMIT,
  maxRetries: envVars.MAX_RETRIES,
  requestTimeout: envVars.REQUEST_TIMEOUT,
  databaseUrl: envVars.DATABASE_URL,
  // Map other variables as needed
};

module.exports = validatedConfig;