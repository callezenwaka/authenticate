// src/types/auth.types.ts
import { Request } from 'express';
import * as oauth from 'openid-client';
import { ServiceProvider } from '@/provider';
// import { UserInfo } from './auth.types';

export interface UserInfo {
    sub: string;               // Subject - Identifier for the user (required)
    name?: string;             // Full name
    given_name?: string;       // First name
    family_name?: string;      // Last name
    middle_name?: string;      // Middle name
    nickname?: string;         // Casual name
    preferred_username?: string; // Preferred username
    profile?: string;          // Profile page URL
    picture?: string;          // Profile picture URL
    website?: string;          // Website URL
    email?: string;            // Email address
    email_verified?: boolean;  // Whether the email is verified
    gender?: string;           // Gender
    birthdate?: string;        // Birthdate
    zoneinfo?: string;         // Time zone
    locale?: string;           // Locale
    phone_number?: string;     // Phone number
    phone_number_verified?: boolean; // Whether the phone number is verified
    address?: {
        formatted?: string;
        street_address?: string;
        locality?: string;
        region?: string;
        postal_code?: string;
        country?: string;
    };
    updated_at?: number;       // Time the information was last updated
    [key: string]: any;        // Additional custom claims
}

export interface AuthenticatedRequest extends Request {
    user?: UserInfo;
    isAuthenticated: boolean;
    oauthConfig?: oauth.Configuration;
    tokens?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers;
    services?: ServiceProvider; // Optional: If using the ServiceProvider pattern
}