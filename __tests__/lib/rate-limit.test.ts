import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { getRateLimitIp, getRateLimitIdentifier } from '@/lib/rate-limit';

describe('getRateLimitIp', () => {
  it('should extract IP from NextRequest with x-forwarded-for', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '192.168.1.1');
    const req = new NextRequest('http://example.com', { headers });

    expect(getRateLimitIp(req)).toBe('192.168.1.1');
  });

  it('should extract IP from NextRequest with x-real-ip when x-forwarded-for is missing', () => {
    const headers = new Headers();
    headers.set('x-real-ip', '10.0.0.1');
    const req = new NextRequest('http://example.com', { headers });

    expect(getRateLimitIp(req)).toBe('10.0.0.1');
  });

  it('should take first IP from x-forwarded-for with multiple IPs', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1, 172.16.0.1');
    const req = new NextRequest('http://example.com', { headers });

    expect(getRateLimitIp(req)).toBe('192.168.1.1');
  });

  it('should trim whitespace from IP', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '  192.168.1.1  , 10.0.0.1');
    const req = new NextRequest('http://example.com', { headers });

    expect(getRateLimitIp(req)).toBe('192.168.1.1');
  });

  it('should return unknown when no IP headers are present', () => {
    const req = new NextRequest('http://example.com');

    expect(getRateLimitIp(req)).toBe('unknown');
  });

  it('should handle Headers object directly', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '192.168.1.1');

    expect(getRateLimitIp(headers)).toBe('192.168.1.1');
  });

  it('should handle Headers with x-real-ip', () => {
    const headers = new Headers();
    headers.set('x-real-ip', '10.0.0.1');

    expect(getRateLimitIp(headers)).toBe('10.0.0.1');
  });

  it('should return unknown for empty Headers', () => {
    const headers = new Headers();

    expect(getRateLimitIp(headers)).toBe('unknown');
  });
});

describe('getRateLimitIdentifier', () => {
  it('should return userId when provided', () => {
    expect(getRateLimitIdentifier('192.168.1.1', 'user-123')).toBe('user-123');
  });

  it('should return IP when userId is not provided', () => {
    expect(getRateLimitIdentifier('192.168.1.1')).toBe('192.168.1.1');
  });

  it('should return IP when userId is empty string', () => {
    expect(getRateLimitIdentifier('192.168.1.1', '')).toBe('192.168.1.1');
  });

  it('should return anonymous when both are null/undefined', () => {
    expect(getRateLimitIdentifier(null)).toBe('anonymous');
    expect(getRateLimitIdentifier(null, undefined)).toBe('anonymous');
  });

  it('should prefer userId over IP', () => {
    expect(getRateLimitIdentifier('192.168.1.1', 'user-456')).toBe('user-456');
  });
});
