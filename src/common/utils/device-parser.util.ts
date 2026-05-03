import { UAParser } from 'ua-parser-js';
import { Request } from 'express';

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}

export function parseDeviceInfo(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    userAgent,
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop',
  };
}

export function extractIpAddress(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];

  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  return request.ip || 'unknown';
}
