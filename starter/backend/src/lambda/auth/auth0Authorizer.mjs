import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-s4ekzwe3wl6g1qm2.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// Function to verify JWT token
async function verifyToken(authHeader) {
  // Extracting token from authorization header
  const token = getToken(authHeader);
  // Decoding JWT token to get header information
  const jwt = jsonwebtoken.decode(token, { complete: true });

  // Getting JSON Web Key Set (JWKS) from JWKS URL
  const { data: jwks } = await Axios.get(jwksUrl);
  const keys = jwks.keys;

  // Finding the correct certificate based on key ID (kid) from JWT header
  const cert = keys.find(key => key.kid === jwt.header.kid).x5c[0];
  const pem = cert.match(/.{1,64}/g).join('\n');

  // Verifying token signature using PEM-encoded certificate
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, pem, { algorithms: ['RS256'] }, (err, decodedToken) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedToken);
      }
    });
  });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
