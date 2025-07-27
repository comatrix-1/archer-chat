import { z } from 'zod';

export const ContactScalarFieldEnumSchema = z.enum(['id','fullName','email','phone','address','city','country','linkedin','github','portfolio']);

export default ContactScalarFieldEnumSchema;
